export type ProductAttributeValue = {
    id: number;
    label: string;
    value: string;
};

export type ProductAttribute = {
    id: number;
    name: string;
    slug: string;
    required: boolean;
    isVariantAxis: boolean;
    values: ProductAttributeValue[];
};

export type ProductPackage = {
    id: number;
    quantity: number;
    price: number;
    badge: string | null;
    isDefault: boolean;
    isPopular: boolean;
};

export type ProductInputField = {
    id: number;
    label: string;
    fieldKey: string;
    type: 'TEXT' | 'EMAIL' | 'URL' | 'NUMBER' | 'TEXTAREA' | 'SELECT';
    required: boolean;
    placeholder: string | null;
    helpText: string | null;
    options: string[];
};

export type ProductVariant = {
    id: number;
    label: string;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    manageStock: boolean;
    valueIds: number[];
    packages: ProductPackage[];
};

export type ProductPurchaseProduct = {
    id: number;
    slug: string;
    name: string;
    imageUrl: string | null;
    productType: 'SIMPLE' | 'VARIABLE' | 'VARIABLE_PACKAGE';
    manageStock: boolean;
    stock: number;
    stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_BACKORDER';
    packageLabel: string;
    packageUnitLabel: string;
    attributes: ProductAttribute[];
    variants: ProductVariant[];
    allowedQuantities: number[];
    defaultVariantSelections: Record<string, string>;
    defaultVariantSelectionIds: Record<string, number>;
    inputFields: ProductInputField[];
};

export type ProductSelections = Record<string, { label: string; value: string }>;
