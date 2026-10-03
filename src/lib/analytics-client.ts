const VISITOR_KEY = 'nexa_analytics_visitor_v1';
const SESSION_KEY = 'nexa_analytics_session_v1';

export type StorefrontAnalyticsEventType = 'PAGE_VIEW' | 'PAGE_ENGAGEMENT' | 'VIEW_ITEM' | 'SELECT_OPTION' | 'SELECT_VARIANT' | 'SELECT_PACKAGE' | 'ADD_TO_CART' | 'VIEW_CART' | 'UPDATE_CART' | 'REMOVE_FROM_CART' | 'BEGIN_CHECKOUT' | 'SELECT_PAYMENT_METHOD';
type GtagItem = { item_id?: string; item_name?: string; item_variant?: string; quantity?: number; price?: number };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const gaItemFor = (event: StorefrontAnalyticsEvent): GtagItem => {
  const quantity = typeof event.metadata?.quantity === 'number' ? event.metadata.quantity : undefined;
  return {
    ...(event.productId ? { item_id: String(event.productId) } : {}),
    ...(event.productName ? { item_name: event.productName } : {}),
    ...(event.variantLabel || event.packageLabel ? { item_variant: [event.variantLabel, event.packageLabel].filter(Boolean).join(' · ') } : {}),
    ...(typeof event.value === 'number' ? { price: quantity && quantity > 0 ? event.value / quantity : event.value } : {}),
    ...(quantity ? { quantity } : {}),
  };
};

const gaItemsFromMetadata = (event: StorefrontAnalyticsEvent): GtagItem[] | undefined => {
  const raw = event.metadata?.items;
  if (!Array.isArray(raw)) return undefined;
  const items = raw.flatMap((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
    const item = value as Record<string, unknown>;
    const productId = item.productId ?? item.item_id;
    const productName = item.productName ?? item.item_name;
    const variantLabel = item.variantLabel ?? item.item_variant;
    const packageLabel = item.packageLabel;
    const quantity = typeof item.quantity === 'number' ? item.quantity : undefined;
    const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : undefined;
    return [{
      ...(productId != null ? { item_id: String(productId) } : {}),
      ...(productName ? { item_name: String(productName) } : {}),
      ...(variantLabel || packageLabel ? { item_variant: [variantLabel, packageLabel].filter(Boolean).map(String).join(' · ') } : {}),
      ...(quantity ? { quantity } : {}),
      ...(unitPrice != null ? { price: unitPrice } : {}),
    }];
  });
  return items.length ? items : undefined;
};

const bridgeToGoogleAnalytics = (event: StorefrontAnalyticsEvent) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  const item = gaItemFor(event);
  const metadataItems = gaItemsFromMetadata(event);
  const ecommerce = {
    ...(event.currency ? { currency: event.currency } : {}),
    ...(typeof event.value === 'number' ? { value: event.value } : {}),
    ...(metadataItems ? { items: metadataItems } : Object.keys(item).length ? { items: [item] } : {}),
  };
  switch (event.eventType) {
    case 'VIEW_ITEM': window.gtag('event', 'view_item', ecommerce); break;
    case 'ADD_TO_CART': window.gtag('event', 'add_to_cart', ecommerce); break;
    case 'VIEW_CART': window.gtag('event', 'view_cart', ecommerce); break;
    case 'UPDATE_CART': window.gtag('event', 'update_cart', { ...ecommerce, ...event.metadata }); break;
    case 'REMOVE_FROM_CART': window.gtag('event', 'remove_from_cart', ecommerce); break;
    case 'BEGIN_CHECKOUT': window.gtag('event', 'begin_checkout', ecommerce); break;
    case 'SELECT_PAYMENT_METHOD': window.gtag('event', 'add_payment_info', { ...ecommerce, payment_type: event.metadata?.gatewayName || event.metadata?.gatewayKey || undefined }); break;
    case 'SELECT_VARIANT': window.gtag('event', 'select_item', { ...ecommerce, items: [item] }); break;
    case 'SELECT_OPTION': window.gtag('event', 'select_product_option', { ...ecommerce, ...event.metadata }); break;
    case 'SELECT_PACKAGE': window.gtag('event', 'select_product_package', { ...ecommerce, ...event.metadata }); break;
    default: break;
  }
};

export function trackGooglePurchase({ transactionId, value, currency }: { transactionId: string; value: number; currency: string }) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  const key = `nexa_ga_purchase_${transactionId}`;
  if (window.sessionStorage.getItem(key)) return;
  window.sessionStorage.setItem(key, '1');
  window.gtag('event', 'purchase', { transaction_id: transactionId, value, currency });
}

export type StorefrontAnalyticsEvent = {
  eventType: StorefrontAnalyticsEventType;
  path?: string;
  productId?: number | null;
  variantId?: number | null;
  packageId?: number | null;
  productName?: string | null;
  variantLabel?: string | null;
  packageLabel?: string | null;
  value?: number | null;
  currency?: string | null;
  durationMs?: number;
  metadata?: Record<string, unknown>;
};

const randomKey = () => {
  try { return crypto.randomUUID(); } catch { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`; }
};
const getStored = (storage: Storage, key: string) => {
  const current = storage.getItem(key);
  if (current && current.length >= 8) return current;
  const next = randomKey(); storage.setItem(key, next); return next;
};
const detectDevice = (): 'Desktop' | 'Mobile' | 'Tablet' => {
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|kindle|silk/.test(ua)) return 'Tablet';
  if (/mobile|iphone|android/.test(ua)) return 'Mobile';
  return 'Desktop';
};

export const readAnalyticsIdentity = () => {
  if (typeof window === 'undefined') return null;
  return {
    visitorId: getStored(window.localStorage, VISITOR_KEY),
    sessionId: getStored(window.sessionStorage, SESSION_KEY),
  };
};

const payloadFor = (event: StorefrontAnalyticsEvent) => {
  const identity = readAnalyticsIdentity();
  if (!identity || typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return {
    ...identity,
    eventType: event.eventType,
    path: (event.path || window.location.pathname).slice(0, 500) || '/',
    url: window.location.href.slice(0, 1000),
    referrer: document.referrer.slice(0, 1000) || null,
    deviceType: detectDevice(),
    utmSource: params.get('utm_source')?.slice(0, 120) || null,
    utmMedium: params.get('utm_medium')?.slice(0, 120) || null,
    utmCampaign: params.get('utm_campaign')?.slice(0, 191) || null,
    productId: event.productId ?? null,
    variantId: event.variantId ?? null,
    packageId: event.packageId ?? null,
    productName: event.productName ?? null,
    variantLabel: event.variantLabel ?? null,
    packageLabel: event.packageLabel ?? null,
    value: event.value ?? null,
    currency: event.currency ?? null,
    durationMs: Math.max(0, Math.round(event.durationMs || 0)),
    metadata: event.metadata || null,
  };
};

export async function trackStorefrontEvent(event: StorefrontAnalyticsEvent) {
  if (typeof window === 'undefined') return;
  try {
    const body = payloadFor(event);
    if (!body) return;
    bridgeToGoogleAnalytics(event);
    await fetch('/api/store/analytics/collect', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), keepalive: true, credentials: 'same-origin',
    });
  } catch {
    // Analytics must never interrupt storefront navigation or checkout.
  }
}

export async function trackStorefrontPageView() {
  return trackStorefrontEvent({ eventType: 'PAGE_VIEW' });
}

export function trackStorefrontEngagement(path: string, durationMs: number) {
  if (typeof window === 'undefined' || durationMs < 250) return;
  try {
    const body = payloadFor({ eventType: 'PAGE_ENGAGEMENT', path, durationMs: Math.min(durationMs, 86_400_000) });
    if (!body) return;
    const serialized = JSON.stringify(body);
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/store/analytics/collect', new Blob([serialized], { type: 'application/json' }));
      return;
    }
    void fetch('/api/store/analytics/collect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: serialized, keepalive: true, credentials: 'same-origin' });
  } catch {
    // Best-effort engagement tracking only.
  }
}
