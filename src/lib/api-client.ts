import { headers } from 'next/headers';

export const centralBackendBase = () =>
    (
        process.env.CENTRAL_BACKEND_INTERNAL_URL ||
        process.env.CENTRAL_BACKEND_URL ||
        process.env.CENTRAL_API_INTERNAL_URL ||
        process.env.CENTRAL_API_URL ||
        'http://127.0.0.1:3001'
    ).replace(/\/$/, '');

export const getStorefrontHost = async (): Promise<string> => {
    try {
        const h = await headers();
        return (process.env.NEXA_SITE_HOST || h.get('x-forwarded-host') || h.get('host') || '')
            .split(',')[0]
            .trim()
            .split(':')[0]
            .toLowerCase();
    } catch {
        return (process.env.NEXA_SITE_HOST || '').split(':')[0].toLowerCase();
    }
};

export const centralApiFetch = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const host = await getStorefrontHost();
    const response = await fetch(`${centralBackendBase()}${path}`, {
        ...init,
        headers: {
            ...(init.headers || {}),
            'x-nexa-site-host': host,
        },
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
        const message =
            body && typeof body === 'object' && 'error' in body
                ? String(body.error)
                : `Central backend request failed (${response.status}).`;
        throw new Error(message);
    }
    return body as T;
};
