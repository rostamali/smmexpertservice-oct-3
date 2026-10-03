export type CartPackageOption = {
    id: number;
    quantity: number;
    price: number;
    badge?: string | null;
    isPopular?: boolean;
};

export type CartItem = {
    key: string;
    productId: number;
    productSlug: string;
    productName: string;
    productType?: 'SIMPLE' | 'VARIABLE' | 'VARIABLE_PACKAGE';
    variantId: number;
    variantLabel: string;
    unitPrice: number;
    /** Line multiplier. VARIABLE_PACKAGE keeps this at 1; packageQuantity is the selected tier. */
    quantity: number;
    packageId?: number | null;
    packageLabel?: string | null;
    packageQuantity?: number | null;
    packageUnit?: string | null;
    inventoryUnits?: number;
    packageOptions?: CartPackageOption[];
    packageUnitLabel?: string;
    customInputs?: Record<string, string>;
    allowedQuantities?: number[];
    imageUrl?: string | null;
    selections: Record<string, { label: string; value: string }>;
};
