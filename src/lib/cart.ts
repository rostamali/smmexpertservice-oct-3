import type { CartItem } from '@/types/store';

export const CART_KEY = 'nexa_cart_v1';
export const CART_COUPON_KEY = 'nexa_cart_coupon_v1';

const browserSiteNamespace = () => typeof window === 'undefined' ? 'server' : window.location.host.toLowerCase();
const siteStorageKey = (base: string) => `${base}:${browserSiteNamespace()}`;
const migrateLegacyStorage = (base: string) => {
    if (typeof window === 'undefined') return null;
    const scoped = siteStorageKey(base);
    const existing = localStorage.getItem(scoped);
    if (existing !== null) return existing;
    const legacy = localStorage.getItem(base);
    if (legacy !== null) {
        localStorage.setItem(scoped, legacy);
        localStorage.removeItem(base);
    }
    return legacy;
};

const stableRecord = <T>(record: Record<string, T> | undefined): Record<string, T> =>
    Object.fromEntries(Object.entries(record || {}).sort(([a], [b]) => a.localeCompare(b)));

const stableSelections = (selections: CartItem['selections'] | undefined): CartItem['selections'] =>
    Object.fromEntries(
        Object.entries(selections || {})
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => [key, { label: value.label, value: value.value }]),
    );

export const buildCartItemKey = ({
    productId,
    variantId,
    packageId,
    selections,
    customInputs,
}: {
    productId: number;
    variantId: number;
    packageId?: number | null;
    selections: CartItem['selections'];
    customInputs?: Record<string, string>;
}) => `${productId}:${variantId}:${packageId ?? 0}:${JSON.stringify(stableSelections(selections))}:${JSON.stringify(stableRecord(customInputs))}`;

const canonicalCartItemKey = (item: CartItem) => buildCartItemKey({
    productId: item.productId,
    variantId: item.variantId,
    packageId: item.packageId,
    selections: item.selections,
    customInputs: item.customInputs,
});

/**
 * Keeps legacy/local cart data structurally valid and canonicalizes item keys.
 * Package products represent a tier, not a line multiplier, so two identical
 * product + variant + package + selection/input combinations collapse into one.
 */
export const normalizeCartItems = (items: CartItem[]): CartItem[] => {
    const byKey = new Map<string, CartItem>();

    for (const item of items) {
        if (!item) continue;

        const repairedPackage = (item.productType === 'VARIABLE_PACKAGE' && !item.packageId && item.packageOptions?.length)
            ? (item.packageOptions.find((option) => option.quantity === item.packageQuantity)
                || item.packageOptions.find((option) => Math.abs(Number(option.price) - Number(item.unitPrice)) < 0.000001)
                || null)
            : null;
        const repairedItem: CartItem = repairedPackage ? {
            ...item,
            packageId: repairedPackage.id,
            packageQuantity: repairedPackage.quantity,
            packageLabel: item.packageLabel || `${repairedPackage.quantity} ${item.packageUnitLabel || item.packageUnit || 'Unit'}`,
            quantity: 1,
            unitPrice: repairedPackage.price,
        } : item;
        const key = canonicalCartItemKey(repairedItem);
        const canonicalItem = { ...repairedItem, key };
        const existing = byKey.get(key);
        if (!existing) {
            byKey.set(key, canonicalItem);
            continue;
        }

        if (item.productType === 'VARIABLE_PACKAGE' || existing.productType === 'VARIABLE_PACKAGE') {
            byKey.set(key, {
                ...existing,
                ...canonicalItem,
                quantity: 1,
            });
            continue;
        }

        byKey.set(key, {
            ...existing,
            ...canonicalItem,
            quantity: Math.max(1, (existing.quantity || 0) + (canonicalItem.quantity || 0)),
        });
    }

    return Array.from(byKey.values());
};

export const readCart = (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    try {
        const raw = migrateLegacyStorage(CART_KEY);
        const parsed = raw ? JSON.parse(raw) as CartItem[] : [];
        const safeParsed = Array.isArray(parsed) ? parsed : [];
        const normalized = normalizeCartItems(safeParsed);
        const normalizedJson = JSON.stringify(normalized);

        // Repair legacy duplicate/non-canonical carts without emitting another event.
        if (raw !== normalizedJson) {
            localStorage.setItem(siteStorageKey(CART_KEY), normalizedJson);
        }

        return normalized;
    } catch {
        return [];
    }
};

export const writeCart = (items: CartItem[], options: { openDrawer?: boolean } = {}): CartItem[] => {
    const normalized = normalizeCartItems(items);
    localStorage.setItem(siteStorageKey(CART_KEY), JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent('nexa:cart-updated', {
        detail: { items: normalized, openDrawer: options.openDrawer ?? false },
    }));
    return normalized;
};

export const readCartCoupon = () => typeof window === 'undefined' ? '' : migrateLegacyStorage(CART_COUPON_KEY) || '';
export const writeCartCoupon = (code: string) => {
    const key = siteStorageKey(CART_COUPON_KEY);
    if (code) localStorage.setItem(key, code.toUpperCase());
    else localStorage.removeItem(key);
    window.dispatchEvent(new CustomEvent('nexa:coupon-updated', { detail: code.toUpperCase() }));
};

/**
 * Package products treat the package unit number as the customer-facing quantity.
 * The cart +/- buttons step through configured package tiers (100 -> 200 -> 500)
 * instead of multiplying the line quantity. Occupied tiers for the same complete
 * configuration are skipped so +/- always moves to the next available tier.
 */
export const stepCartItem = (item: CartItem, direction: 1 | -1, cartItems: CartItem[] = []): CartItem => {
    if (item.productType === 'VARIABLE_PACKAGE' && item.packageOptions?.length) {
        const options = [...item.packageOptions].sort((a, b) => a.quantity - b.quantity || a.id - b.id);
        const foundIndex = options.findIndex((option) => option.id === item.packageId);
        const currentIndex = foundIndex >= 0 ? foundIndex : (direction === 1 ? -1 : options.length);

        // Move in the requested direction until we find the next *available* tier.
        // Occupied tiers for the same complete product + variant + selections + inputs
        // are skipped instead of blocking access to later package tiers.
        for (let nextIndex = currentIndex + direction; nextIndex >= 0 && nextIndex < options.length; nextIndex += direction) {
            const next = options[nextIndex];
            if (!next || next.id === item.packageId) continue;

            const key = buildCartItemKey({
                productId: item.productId,
                variantId: item.variantId,
                packageId: next.id,
                selections: item.selections,
                customInputs: item.customInputs,
            });

            const targetExists = cartItems.some((existing) => canonicalCartItemKey(existing) === key);
            if (targetExists) continue;

            const unit = item.packageUnitLabel || item.packageUnit || 'Unit';
            return {
                ...item,
                key,
                quantity: 1,
                packageId: next.id,
                packageQuantity: next.quantity,
                packageUnit: unit,
                packageLabel: `${next.quantity} ${unit}`,
                inventoryUnits: next.quantity,
                unitPrice: next.price,
            };
        }

        // No unoccupied tier remains in this direction.
        return item;
    }

    const allowed = item.allowedQuantities?.length ? [...item.allowedQuantities].sort((a, b) => a - b) : null;
    let nextQuantity = item.quantity + direction;
    if (allowed) {
        const index = allowed.indexOf(item.quantity);
        const safeIndex = index >= 0 ? index : 0;
        nextQuantity = allowed[Math.max(0, Math.min(allowed.length - 1, safeIndex + direction))] ?? item.quantity;
    } else {
        nextQuantity = Math.max(1, nextQuantity);
    }
    return { ...item, quantity: nextQuantity };
};

export const customerFacingQuantity = (item: CartItem) => item.productType === 'VARIABLE_PACKAGE'
    ? (item.packageQuantity ?? 1)
    : item.quantity;
