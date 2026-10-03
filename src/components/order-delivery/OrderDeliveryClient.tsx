'use client';

import { useEffect, useState } from 'react';

import OrderVerificationForm from './OrderVerificationForm';
import OrderDeliveryDetails from './OrderDeliveryDetails';

type DeliveryItem = {
    id: number;
    label: string;
    details: string;
};

type Result = {
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: string;
    currency: string;
    createdAt: string;
    items: Array<{
        id: number;
        title: string;
        variantLabel: string;
        quantity: number;
        packageQuantity: number | null;
        packageUnit: string | null;
        lineTotal: string;
    }>;
    deliveryAvailable: boolean;
    deliveryItems: DeliveryItem[];
};

type OrderDeliveryClientProps = {
    token: string;
    initialEmail?: string;
    siteName: string;
};

export default function OrderDeliveryClient({
    token,
    initialEmail = '',
    siteName,
}: OrderDeliveryClientProps) {
    const [email, setEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<Result | null>(null);
    const [error, setError] = useState('');
    const [attemptedAuto, setAttemptedAuto] = useState(false);
    const [activeDelivery, setActiveDelivery] = useState<number | null>(null);

    const verify = async (candidate = email) => {
        const normalized = candidate.trim().toLowerCase();

        if (!/^\S+@\S+\.\S+$/.test(normalized)) {
            setError('Please enter the email address used at checkout.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/orders/delivery/${encodeURIComponent(token)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: normalized }),
            });

            const body = await response.json();

            if (!response.ok) {
                throw new Error(body.error || 'Could not verify this order.');
            }

            setResult(body);
            setActiveDelivery(body.deliveryItems?.[0]?.id || null);
        } catch (verifyError) {
            setError(
                verifyError instanceof Error ? verifyError.message : 'Could not verify this order.',
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!attemptedAuto && initialEmail && /^\S+@\S+\.\S+$/.test(initialEmail)) {
            setAttemptedAuto(true);
            void verify(initialEmail);
        }
    }, [attemptedAuto, initialEmail]);

    if (!result) {
        return (
            <OrderVerificationForm
                email={email}
                loading={loading}
                error={error}
                initialEmail={initialEmail}
                setEmail={(value) => {
                    setEmail(value);
                    setError('');
                }}
                onVerify={() => void verify()}
                siteName={siteName}
            />
        );
    }

    const active =
        result.deliveryItems.find((item) => item.id === activeDelivery) ||
        result.deliveryItems[0] ||
        null;

    return (
        <OrderDeliveryDetails
            result={result}
            active={active}
            setActive={(id) => setActiveDelivery(id)}
            siteName={siteName}
        />
    );
}
