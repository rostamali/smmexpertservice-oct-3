'use client';

import { useEffect } from 'react';

/**
 * Native number inputs change value when the focused field receives a mouse-wheel
 * event or ArrowUp/ArrowDown. This global guard keeps number fields manual-entry
 * only while retaining native min/max/step semantics for validation.
 */
export default function NumberInputGuard() {
    useEffect(() => {
        const isNumberInput = (target: EventTarget | null): target is HTMLInputElement =>
            target instanceof HTMLInputElement && target.type === 'number';

        const onWheel = (event: WheelEvent) => {
            if (!isNumberInput(event.target) || document.activeElement !== event.target) return;
            event.preventDefault();
            event.target.blur();
        };

        const onKeyDown = (event: KeyboardEvent) => {
            if (!isNumberInput(event.target)) return;
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') event.preventDefault();
        };

        document.addEventListener('wheel', onWheel, { capture: true, passive: false });
        document.addEventListener('keydown', onKeyDown, true);
        return () => {
            document.removeEventListener('wheel', onWheel, true);
            document.removeEventListener('keydown', onKeyDown, true);
        };
    }, []);

    return null;
}
