'use client';

import { Check } from 'lucide-react';
import { money } from '@/lib/money';
import { useProductPurchase } from './ProductPurchaseProvider';

export default function ProductConfigurator() {
    const {
        product,
        currency,
        selected,
        quantity,
        selectedPackageId,
        customInputs,
        hasQuantityOption,
        packageFieldLabel,
        availableValueIdsBySlug,
        variationSelectionComplete,
        variant,
        effectiveStock,
        selectAttribute,
        selectPackage,
        updateCustomInput,
        updateQuantity,
    } = useProductPurchase();

    return (
        <div className="space-y-6">
            {product.attributes.map((attribute, attributeIndex) => {
                const available = availableValueIdsBySlug[attribute.slug] || new Set<number>();
                const values = attribute.isVariantAxis
                    ? attribute.values.filter((value) => available.has(value.id))
                    : attribute.values;
                const selectedValueId = selected[attribute.slug] || 0;
                const attributeFieldLabel =
                    attribute.name.replace(/^select\s+/i, '').trim() || attribute.name;

                return (
                    <section className="space-y-3" key={attribute.id}>
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-bold text-site-heading-font">
                                    Select {attributeFieldLabel}
                                </h3>
                                <p className="mt-0.5 text-xs text-site-body-font">
                                    Choose the option that fits this order.
                                </p>
                            </div>
                            {attribute.required ? (
                                <span className="single__product-variation-required--badge">
                                    Required
                                </span>
                            ) : null}
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            {values.map((value) => {
                                const active = selectedValueId === value.id;
                                return (
                                    <button
                                        key={value.id}
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() =>
                                            selectAttribute(
                                                attributeIndex,
                                                attribute.slug,
                                                String(value.id),
                                            )
                                        }
                                        className={`group relative min-h-16 rounded-xl border p-3 text-left transition-all duration-200 ${
                                            active
                                                ? 'border-site-primary bg-slate-50 shadow-[0_10px_30px_rgba(10,22,94,.08)] ring-1 ring-site-primary'
                                                : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span
                                            className={`block pr-6 text-sm font-semibold leading-5 ${
                                                active ? 'text-site-primary' : 'text-slate-950'
                                            }`}
                                        >
                                            {value.label}
                                        </span>
                                        <span className="mt-1 block text-[10px] font-medium uppercase tracking-wide text-site-body-font">
                                            Option
                                        </span>
                                        <span
                                            className={`absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full border transition ${
                                                active
                                                    ? 'border-[var(--brand)] bg-[var(--brand)] text-white'
                                                    : 'border-slate-200 bg-white text-transparent'
                                            }`}
                                        >
                                            <Check size={12} strokeWidth={3} />
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                );
            })}

            {product.productType === 'VARIABLE_PACKAGE' && variant ? (
                <section className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-site-heading-font">
                                Select {packageFieldLabel}
                            </h3>
                            <p className="mt-0.5 text-xs text-site-body-font">
                                Choose your preferred package size.
                            </p>
                        </div>
                        <span className="single__product-variation-required--badge">Required</span>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-3">
                        {variant.packages.map((pkg) => {
                            const unavailable =
                                effectiveStock != null && pkg.quantity > effectiveStock;
                            const active = selectedPackageId === pkg.id;

                            return (
                                <button
                                    type="button"
                                    key={pkg.id}
                                    disabled={unavailable}
                                    className={`relative flex min-h-20 items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all ${
                                        active
                                            ? 'border-site-primary bg-slate-50 shadow-[0_10px_30px_rgba(10,22,94,.08)] ring-1 ring-site-primary'
                                            : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                                    } disabled:cursor-not-allowed disabled:opacity-45`}
                                    onClick={() => selectPackage(pkg)}
                                >
                                    <span>
                                        <strong className="block text-sm font-bold text-site-heading-font">
                                            {pkg.quantity} {product.packageUnitLabel}
                                        </strong>
                                        <span className="mt-1 block text-xs text-slate-600">
                                            {unavailable
                                                ? 'Unavailable'
                                                : pkg.badge ||
                                                  (pkg.isPopular ? 'Popular choice' : 'Available')}
                                        </span>
                                    </span>
                                    <span className="text-base font-extrabold text-site-heading-font h-full inline-flex items-end">
                                        {money(pkg.price, currency)}
                                    </span>
                                    {active ? (
                                        <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-[var(--brand)] text-white">
                                            <Check size={12} strokeWidth={3} />
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>
                </section>
            ) : null}

            {variationSelectionComplete && variant
                ? product.inputFields.map((field) => (
                      <label className="block space-y-2" key={field.id}>
                          <span className="flex items-center justify-between gap-2 text-sm font-bold text-slate-950">
                              {field.label}
                              {field.required ? (
                                  <small className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                      Required
                                  </small>
                              ) : null}
                          </span>

                          {field.type === 'TEXTAREA' ? (
                              <textarea
                                  className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-950 outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-blue-100"
                                  rows={4}
                                  value={customInputs[field.fieldKey] || ''}
                                  placeholder={field.placeholder || ''}
                                  onChange={(event) =>
                                      updateCustomInput(field.fieldKey, event.target.value)
                                  }
                              />
                          ) : field.type === 'SELECT' ? (
                              <select
                                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-blue-100"
                                  value={customInputs[field.fieldKey] || ''}
                                  onChange={(event) =>
                                      updateCustomInput(field.fieldKey, event.target.value)
                                  }
                              >
                                  <option value="">Choose…</option>
                                  {field.options.map((option) => (
                                      <option key={option} value={option}>
                                          {option}
                                      </option>
                                  ))}
                              </select>
                          ) : (
                              <input
                                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-[var(--brand)] focus:ring-2 focus:ring-blue-100"
                                  type={
                                      field.type === 'EMAIL'
                                          ? 'email'
                                          : field.type === 'URL'
                                            ? 'url'
                                            : field.type === 'NUMBER'
                                              ? 'number'
                                              : 'text'
                                  }
                                  value={customInputs[field.fieldKey] || ''}
                                  placeholder={field.placeholder || ''}
                                  onChange={(event) =>
                                      updateCustomInput(field.fieldKey, event.target.value)
                                  }
                              />
                          )}

                          {field.helpText ? (
                              <small className="block text-xs leading-5 text-slate-600">
                                  {field.helpText}
                              </small>
                          ) : null}
                      </label>
                  ))
                : null}

            {!hasQuantityOption && product.productType !== 'VARIABLE_PACKAGE' ? (
                <section className="space-y-3">
                    <div>
                        <h3 className="text-sm font-bold text-slate-950">Select Quantity</h3>
                        <p className="mt-0.5 text-xs text-slate-600">Select the cart quantity.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {product.allowedQuantities.map((qty) => (
                            <button
                                type="button"
                                key={qty}
                                className={`min-w-12 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                                    qty === quantity
                                        ? 'border-[var(--brand)] bg-slate-50 text-blue-500 ring-1 ring-[var(--brand)]'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'
                                }`}
                                onClick={() => updateQuantity(qty)}
                            >
                                {qty}
                            </button>
                        ))}
                    </div>
                </section>
            ) : null}
        </div>
    );
}
