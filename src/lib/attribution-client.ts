export type CheckoutAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  landingUrl?: string;
  referrerUrl?: string;
  lastUrl?: string;
  deviceType?: 'Desktop' | 'Mobile' | 'Tablet';
  pageViews?: number;
  firstSeenAt?: string;
  analyticsVisitorId?: string;
  analyticsSessionId?: string;
};

const KEY = 'nexa_checkout_attribution_v1';
const clamp = (value: string | null | undefined, max = 1000) => (value || '').slice(0, max);

const detectDevice = (): CheckoutAttribution['deviceType'] => {
  if (typeof navigator === 'undefined') return 'Desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|kindle|silk/.test(ua)) return 'Tablet';
  if (/mobile|iphone|android/.test(ua)) return 'Mobile';
  return 'Desktop';
};

export function readCheckoutAttribution(): CheckoutAttribution | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CheckoutAttribution;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function trackCurrentPageAttribution() {
  if (typeof window === 'undefined') return;
  try {
    const current = readCheckoutAttribution() || {};
    const params = new URLSearchParams(window.location.search);
    const now = new Date().toISOString();
    const next: CheckoutAttribution = {
      ...current,
      landingUrl: current.landingUrl || clamp(window.location.href),
      referrerUrl: current.referrerUrl || clamp(document.referrer),
      lastUrl: clamp(window.location.href),
      deviceType: detectDevice(),
      pageViews: Math.max(0, Number(current.pageViews || 0)) + 1,
      firstSeenAt: current.firstSeenAt || now,
    };

    // Preserve the first campaign source for the checkout session. If the user
    // lands without UTM parameters and later enters through a tagged link in the
    // same session, capture that first tagged source at that point.
    const utmMap: Array<[keyof CheckoutAttribution, string]> = [
      ['utmSource', 'utm_source'],
      ['utmMedium', 'utm_medium'],
      ['utmCampaign', 'utm_campaign'],
      ['utmTerm', 'utm_term'],
      ['utmContent', 'utm_content'],
    ];
    for (const [field, queryName] of utmMap) {
      const incoming = clamp(params.get(queryName), 255);
      if (incoming && !next[field]) (next as Record<string, unknown>)[field] = incoming;
    }

    window.sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Attribution is useful metadata, never a checkout blocker.
  }
}
