'use client';

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { buildCartItemKey, readCart, writeCart } from '@/lib/cart';
import { trackStorefrontEvent } from '@/lib/analytics-client';
import type { CartItem } from '@/types/store';
import type {
    ProductAttribute,
    ProductPackage,
    ProductPurchaseProduct,
    ProductSelections,
    ProductVariant,
} from './types';

export const isQuantityAttribute = (attribute: ProductAttribute) => {
    const normalized = attribute.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    return normalized === 'quantity' || normalized === 'select quantity';
};

/**
 * Return the values this variant explicitly stores for one attribute.
 * Empty means WooCommerce-style "Any {attribute}" wildcard.
 */
export const variantValueIdsForAttribute = (
    variant: ProductVariant,
    attribute: ProductAttribute,
) => {
    const ids = new Set(attribute.values.map((value) => value.id));
    return variant.valueIds.filter((valueId) => ids.has(valueId));
};

/**
 * A wildcard variation matches every value of that attribute. Exact values are
 * checked when the variation explicitly stores a value for the attribute.
 */
export const variantMatchesSelection = (
    variant: ProductVariant,
    attributes: ProductAttribute[],
    selected: Record<string, number>,
) => {
    for (const attribute of attributes.filter((item) => item.isVariantAxis)) {
        const selectedValueId = selected[attribute.slug];
        if (!selectedValueId) continue;

        const explicit = variantValueIdsForAttribute(variant, attribute);
        if (!explicit.length) continue;
        if (!explicit.includes(selectedValueId)) return false;
    }

    return true;
};

export const defaultSelectionIds = (
    attributes: ProductAttribute[],
    variants: ProductVariant[],
    defaults: Record<string, string> | null | undefined,
    canonicalIds: Record<string, number> | null | undefined,
) => {
    const selected: Record<string, number> = {};
    const axisAttributes = attributes.filter((attribute) => attribute.isVariantAxis);

    for (const attribute of axisAttributes) {
        const canonicalId = Number(canonicalIds?.[attribute.slug] || 0);
        let value =
            canonicalId > 0 ? attribute.values.find((item) => item.id === canonicalId) : undefined;

        if (!value) {
            const configured = defaults?.[attribute.slug];
            if (configured) {
                const normalized = configured.trim().toLowerCase();
                value = attribute.values.find(
                    (item) =>
                        item.value === configured ||
                        item.label === configured ||
                        item.value.trim().toLowerCase() === normalized ||
                        item.label.trim().toLowerCase() === normalized ||
                        String(item.id) === configured,
                );
            }
        }

        if (!value) continue;

        const trial = { ...selected, [attribute.slug]: value.id };
        if (variants.some((variant) => variantMatchesSelection(variant, axisAttributes, trial))) {
            selected[attribute.slug] = value.id;
        }
    }

    return selected;
};

type ProductPurchaseContextValue = {
    product: ProductPurchaseProduct;
    currency: string;
    selected: Record<string, number>;
    quantity: number;
    notice: string;
    selectedPackageId: number | null;
    customInputs: Record<string, string>;
    hasQuantityOption: boolean;
    packageFieldLabel: string;
    availableValueIdsBySlug: Record<string, Set<number>>;
    variationSelectionComplete: boolean;
    isComplete: boolean;
    variant: ProductVariant | null;
    effectiveStock: number | null;
    purchasablePackages: ProductPackage[];
    selectedPackage: ProductPackage | null;
    selections: ProductSelections;
    resolvedVariantLabel: string;
    effectivePrice: number;
    comparePrice: number | null;
    stockUnitsNeeded: number;
    total: number;
    canPurchase: boolean;
    selectAttribute: (attributeIndex: number, slug: string, rawValue: string) => void;
    selectPackage: (pkg: ProductPackage) => void;
    updateCustomInput: (fieldKey: string, value: string) => void;
    updateQuantity: (quantity: number) => void;
    clearNotice: () => void;
    addToCart: () => void;
    buyNow: () => void;
};

const ProductPurchaseContext = createContext<ProductPurchaseContextValue | null>(null);

export function useProductPurchase() {
    const context = useContext(ProductPurchaseContext);
    if (!context) {
        throw new Error('useProductPurchase must be used inside ProductPurchaseProvider.');
    }
    return context;
}

export default function ProductPurchaseProvider({
    product,
    currency,
    children,
}: {
    product: ProductPurchaseProduct;
    currency: string;
    children: ReactNode;
}) {
    const router = useRouter();
    const defaultSelectionKey = JSON.stringify([
        product.id,
        product.defaultVariantSelections,
        product.defaultVariantSelectionIds,
    ]);

    const [selected, setSelected] = useState<Record<string, number>>(() =>
        defaultSelectionIds(
            product.attributes,
            product.variants,
            product.defaultVariantSelections,
            product.defaultVariantSelectionIds,
        ),
    );
    const hasQuantityOption = useMemo(
        () => product.attributes.some(isQuantityAttribute),
        [product.attributes],
    );
    const [quantity, setQuantity] = useState(
        hasQuantityOption ? 1 : product.allowedQuantities[0] || 1,
    );
    const [notice, setNotice] = useState('');
    const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
    const [customInputs, setCustomInputs] = useState<Record<string, string>>({});
    const trackedViewRef = useRef<number | null>(null);
    const trackedVariantRef = useRef<number | null>(null);

    const packageFieldLabel =
        (product.packageLabel || 'Quantity').replace(/^select\s+/i, '').trim() || 'Quantity';

    const axisAttributes = useMemo(
        () => product.attributes.filter((attribute) => attribute.isVariantAxis),
        [product.attributes],
    );

    useEffect(() => {
        setSelected(
            defaultSelectionIds(
                product.attributes,
                product.variants,
                product.defaultVariantSelections,
                product.defaultVariantSelectionIds,
            ),
        );
        setSelectedPackageId(null);
        setCustomInputs({});
        setQuantity(hasQuantityOption ? 1 : product.allowedQuantities[0] || 1);
        setNotice('');
        trackedVariantRef.current = null;
        // Reset only when the product or its configured defaults change; user clicks must not trigger this.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultSelectionKey]);

    /** WooCommerce-style cascading availability, including wildcard variation rows. */
    const availableValueIdsBySlug = useMemo(() => {
        const result: Record<string, Set<number>> = {};
        const priorSelection: Record<string, number> = {};

        for (const attribute of product.attributes) {
            if (!attribute.isVariantAxis) {
                result[attribute.slug] = new Set(attribute.values.map((value) => value.id));
                continue;
            }

            const available = new Set<number>();
            for (const value of attribute.values) {
                const trial = { ...priorSelection, [attribute.slug]: value.id };
                const exists = product.variants.some((variant) =>
                    variantMatchesSelection(variant, axisAttributes, trial),
                );
                if (exists) available.add(value.id);
            }
            result[attribute.slug] = available;

            const current = selected[attribute.slug];
            if (current && available.has(current)) priorSelection[attribute.slug] = current;
        }

        return result;
    }, [axisAttributes, product.attributes, product.variants, selected]);

    const variationSelectionComplete = axisAttributes.every((attribute) =>
        Boolean(selected[attribute.slug]),
    );
    const isComplete = product.attributes.every(
        (attribute) => !attribute.required || Boolean(selected[attribute.slug]),
    );

    /** Exact variations beat wildcard variations. */
    const variant = useMemo(() => {
        if (!variationSelectionComplete) return null;
        if (!axisAttributes.length) return product.variants[0] || null;

        const matches = product.variants
            .map((item) => {
                let specificity = 0;
                for (const attribute of axisAttributes) {
                    const selectedValueId = selected[attribute.slug];
                    const explicit = variantValueIdsForAttribute(item, attribute);
                    if (!explicit.length) continue;
                    if (!selectedValueId || !explicit.includes(selectedValueId)) return null;
                    specificity += 1;
                }
                return { item, specificity };
            })
            .filter((entry): entry is { item: ProductVariant; specificity: number } =>
                Boolean(entry),
            )
            .sort((a, b) => b.specificity - a.specificity || a.item.id - b.item.id);

        return matches[0]?.item || null;
    }, [axisAttributes, variationSelectionComplete, product.variants, selected]);

    const effectiveStock = variant
        ? variant.manageStock
            ? variant.stock
            : product.manageStock
              ? product.stock
              : null
        : null;

    const purchasablePackages = useMemo(() => {
        if (!variant || product.productType !== 'VARIABLE_PACKAGE') return [];
        return variant.packages.filter(
            (pkg) => effectiveStock == null || pkg.quantity <= effectiveStock,
        );
    }, [variant, product.productType, effectiveStock]);

    useEffect(() => {
        if (!variant || product.productType !== 'VARIABLE_PACKAGE') {
            setSelectedPackageId(null);
            return;
        }

        const current = purchasablePackages.find((pkg) => pkg.id === selectedPackageId);
        if (current) return;

        const preferred =
            purchasablePackages.find((pkg) => pkg.isDefault) || purchasablePackages[0] || null;
        setSelectedPackageId(preferred?.id ?? null);
    }, [variant?.id, product.productType, purchasablePackages, selectedPackageId]);

    const selectedPackage = useMemo(
        () => variant?.packages.find((pkg) => pkg.id === selectedPackageId) || null,
        [variant, selectedPackageId],
    );

    const selections = useMemo(() => {
        const output: ProductSelections = {};
        for (const attribute of product.attributes) {
            const valueId = selected[attribute.slug];
            const value = attribute.values.find((item) => item.id === valueId);
            if (value) output[attribute.slug] = { label: value.label, value: value.value };
        }
        return output;
    }, [product.attributes, selected]);

    const resolvedVariantLabel = useMemo(() => {
        const labels = product.attributes
            .map(
                (attribute) =>
                    selections[attribute.slug]?.label || selections[attribute.slug]?.value || '',
            )
            .map((value) => String(value).trim())
            .filter(Boolean);

        return labels.length ? labels.join(' / ') : variant?.label || '';
    }, [product.attributes, selections, variant?.label]);

    const effectivePrice = selectedPackage?.price ?? variant?.price ?? 0;
    const comparePrice =
        product.productType === 'VARIABLE_PACKAGE' ? null : (variant?.compareAtPrice ?? null);
    const stockUnitsNeeded =
        product.productType === 'VARIABLE_PACKAGE' ? (selectedPackage?.quantity ?? 0) : quantity;
    const total = effectivePrice * (product.productType === 'VARIABLE_PACKAGE' ? 1 : quantity);
    const canPurchase = Boolean(
        variant &&
        isComplete &&
        (product.productType !== 'VARIABLE_PACKAGE' || selectedPackage) &&
        (effectiveStock == null || effectiveStock >= stockUnitsNeeded),
    );

    useEffect(() => {
        if (trackedViewRef.current === product.id) return;
        trackedViewRef.current = product.id;
        void trackStorefrontEvent({
            eventType: 'VIEW_ITEM',
            productId: product.id,
            productName: product.name,
            value: effectivePrice || null,
            currency,
        });
    }, [product.id, product.name, currency, effectivePrice]);

    useEffect(() => {
        if (!variant || !variationSelectionComplete || trackedVariantRef.current === variant.id) {
            return;
        }
        trackedVariantRef.current = variant.id;
        void trackStorefrontEvent({
            eventType: 'SELECT_VARIANT',
            productId: product.id,
            productName: product.name,
            variantId: variant.id,
            variantLabel: variant.label,
            value: effectivePrice || null,
            currency,
            metadata: { selections },
        });
    }, [
        variant?.id,
        variationSelectionComplete,
        product.id,
        product.name,
        effectivePrice,
        currency,
        selections,
    ]);

    const selectAttribute = (attributeIndex: number, slug: string, rawValue: string) => {
        const valueId = rawValue ? Number(rawValue) : 0;
        const attribute = product.attributes[attributeIndex];
        const selectedValue = attribute?.values.find((item) => item.id === valueId);

        if (attribute && selectedValue) {
            void trackStorefrontEvent({
                eventType: 'SELECT_OPTION',
                productId: product.id,
                productName: product.name,
                metadata: {
                    attribute: attribute.name,
                    attributeSlug: attribute.slug,
                    value: selectedValue.label,
                    valueId,
                },
            });
        }

        setSelected((current) => {
            const next = { ...current };
            if (valueId) next[slug] = valueId;
            else delete next[slug];

            // Changing an earlier variation axis can invalidate later selections.
            // Keep later values only when a real/wildcard variation still supports them.
            const axisBefore: Record<string, number> = {};
            for (let index = 0; index < product.attributes.length; index++) {
                const currentAttribute = product.attributes[index];
                if (!currentAttribute.isVariantAxis) continue;

                const chosen = next[currentAttribute.slug];
                if (!chosen) continue;

                const trial = { ...axisBefore, [currentAttribute.slug]: chosen };
                const stillValid = product.variants.some((item) =>
                    variantMatchesSelection(item, axisAttributes, trial),
                );

                if (!stillValid && index > attributeIndex) {
                    delete next[currentAttribute.slug];
                    continue;
                }
                if (stillValid) axisBefore[currentAttribute.slug] = chosen;
            }

            return next;
        });
        setNotice('');
    };

    const selectPackage = (pkg: ProductPackage) => {
        if (!variant) return;
        setSelectedPackageId(pkg.id);
        setNotice('');
        void trackStorefrontEvent({
            eventType: 'SELECT_PACKAGE',
            productId: product.id,
            productName: product.name,
            variantId: variant.id,
            variantLabel: variant.label,
            packageId: pkg.id,
            packageLabel: `${pkg.quantity} ${product.packageUnitLabel}`,
            value: pkg.price,
            currency,
        });
    };

    const updateCustomInput = (fieldKey: string, value: string) => {
        setCustomInputs((state) => ({ ...state, [fieldKey]: value }));
        setNotice('');
    };

    const updateQuantity = (nextQuantity: number) => {
        setQuantity(nextQuantity);
        setNotice('');
    };

    const buildItem = (): CartItem | null => {
        if (!isComplete) {
            setNotice('Please select an option for every product attribute.');
            return null;
        }
        if (!variant) {
            setNotice(
                'This option combination is not available. Please choose another combination.',
            );
            return null;
        }
        if (product.productType === 'VARIABLE_PACKAGE' && !selectedPackage) {
            setNotice('Please choose a package.');
            return null;
        }

        for (const field of product.inputFields) {
            const value = (customInputs[field.fieldKey] || '').trim();
            if (field.required && !value) {
                setNotice(`Please enter ${field.label}.`);
                return null;
            }
            if (value && field.type === 'EMAIL' && !/^\S+@\S+\.\S+$/.test(value)) {
                setNotice(`Please enter a valid ${field.label}.`);
                return null;
            }
            if (value && field.type === 'URL') {
                try {
                    new URL(value);
                } catch {
                    setNotice(`Please enter a valid ${field.label}.`);
                    return null;
                }
            }
        }

        if (effectiveStock != null && effectiveStock < stockUnitsNeeded) {
            setNotice(
                `Only ${effectiveStock} ${product.packageUnitLabel || 'units'} are currently available.`,
            );
            return null;
        }

        const key = buildCartItemKey({
            productId: product.id,
            variantId: variant.id,
            packageId: selectedPackage?.id ?? null,
            selections,
            customInputs,
        });

        return {
            key,
            productId: product.id,
            productSlug: product.slug,
            productName: product.name,
            variantId: variant.id,
            variantLabel: resolvedVariantLabel || variant.label,
            unitPrice: effectivePrice,
            quantity: product.productType === 'VARIABLE_PACKAGE' ? 1 : quantity,
            productType: product.productType,
            packageId: selectedPackage?.id || null,
            packageLabel: selectedPackage
                ? `${selectedPackage.quantity} ${product.packageUnitLabel}`
                : null,
            packageQuantity: selectedPackage?.quantity ?? null,
            packageUnit: selectedPackage ? product.packageUnitLabel : null,
            inventoryUnits: selectedPackage ? selectedPackage.quantity : 1,
            packageOptions:
                product.productType === 'VARIABLE_PACKAGE' && variant
                    ? purchasablePackages.map((pkg) => ({
                          id: pkg.id,
                          quantity: pkg.quantity,
                          price: pkg.price,
                          badge: pkg.badge,
                          isPopular: pkg.isPopular,
                      }))
                    : undefined,
            packageUnitLabel:
                product.productType === 'VARIABLE_PACKAGE' ? product.packageUnitLabel : undefined,
            customInputs,
            allowedQuantities:
                product.productType === 'VARIABLE_PACKAGE' ? [1] : product.allowedQuantities,
            imageUrl: product.imageUrl,
            selections,
        };
    };

    const addToCart = () => {
        const item = buildItem();
        if (!item) return;

        const cart = readCart();
        const existingIndex = cart.findIndex((entry) => entry.key === item.key);
        if (existingIndex >= 0) cart[existingIndex] = item;
        else cart.push(item);

        writeCart(cart, { openDrawer: false });
        void trackStorefrontEvent({
            eventType: 'ADD_TO_CART',
            productId: product.id,
            productName: product.name,
            variantId: item.variantId,
            variantLabel: item.variantLabel,
            packageId: item.packageId,
            packageLabel: item.packageLabel,
            value: item.unitPrice * item.quantity,
            currency,
            metadata: { quantity: item.quantity, selections: item.selections },
        });
        setNotice('Product added to cart.');
    };

    const buyNow = () => {
        const item = buildItem();
        if (!item) return;

        writeCart([item], { openDrawer: false });
        // BEGIN_CHECKOUT is recorded by CheckoutClient after /cart actually loads.
        router.push('/cart');
    };

    const value: ProductPurchaseContextValue = {
        product,
        currency,
        selected,
        quantity,
        notice,
        selectedPackageId,
        customInputs,
        hasQuantityOption,
        packageFieldLabel,
        availableValueIdsBySlug,
        variationSelectionComplete,
        isComplete,
        variant,
        effectiveStock,
        purchasablePackages,
        selectedPackage,
        selections,
        resolvedVariantLabel,
        effectivePrice,
        comparePrice,
        stockUnitsNeeded,
        total,
        canPurchase,
        selectAttribute,
        selectPackage,
        updateCustomInput,
        updateQuantity,
        clearNotice: () => setNotice(''),
        addToCart,
        buyNow,
    };

    return (
        <ProductPurchaseContext.Provider value={value}>{children}</ProductPurchaseContext.Provider>
    );
}
