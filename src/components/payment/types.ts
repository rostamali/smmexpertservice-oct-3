export type InitialPayment = {
  orderNumber: string;
  paymentStatus: string;
  gatewayKey: string;
  gatewayLabel: string;
  gatewayDescription: string | null;
  gatewayImageUrl: string | null;
  paymentSeoTitle: string | null;
  paymentSeoDescription: string | null;
  paymentSeoImageUrl: string | null;
  externalId: string | null;
  payAmount: string | null;
  payCurrency: string | null;
  payAddress: string | null;
  total: string;
  currency: string;
  paymentCreatedAt: string;
  paymentExpiresAt: string | null;
  serverNow: string;
  deliveryUrl: string | null;
};

export type NowPaymentCurrency = {
  code: string;
  ticker: string;
  name: string;
  network: string | null;
  logoUrl: string | null;
  availableForPayment: boolean;
  availableForPayout: boolean;
};

export type PayGateProvider = {
  id: string;
  name: string;
  displayName?: string;
  imageUrl?: string | null;
  status: string;
  minimumCurrency: string;
  minimumAmount: number;
  available: boolean;
  reason: string | null;
  checkoutAmount: number;
  checkoutCurrency: string;
  sourceAmount: number;
  sourceCurrency: string;
  converted: boolean;
};

export const terminalStatuses = ['PAID', 'FAILED', 'EXPIRED', 'REFUNDED'];
