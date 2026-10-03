import fs from 'node:fs';

const checkoutPath = 'src/components/checkout/CheckoutClient.tsx';
const source = fs.readFileSync(checkoutPath, 'utf8');

const checks = [
  [
    'Coupon apply performs an explicit request every click',
    /const applyCoupon = async \(\) =>[\s\S]*?candidateQuote = await requestQuote\(normalized\)/,
  ],
  [
    'Rejected coupon recalculates without coupon to preserve payment discount',
    /catch \(couponError\)[\s\S]*?const baseQuote = await requestQuote\(null\)/,
  ],
  [
    'HTTP 200 with coupon=null also recalculates without coupon',
    /if \(!candidateQuote\.coupon \|\| appliedCode !== normalized\)[\s\S]*?const baseQuote = await requestQuote\(null\)/,
  ],
  [
    'Invalid coupon is not stored as the applied coupon',
    /setCouponCode\(''\);[\s\S]*?writeCartCoupon\(''\);/,
  ],
  [
    'Failed coupon text remains in the input for same-value retry',
    /setCouponInput\(normalized\);[\s\S]*?catch \(couponError\)[\s\S]*?setCouponCode\(''\)/,
  ],
  [
    'Coupon loading state terminates even when an auto quote supersedes it',
    /couponApplySequence = useRef\(0\)[\s\S]*?finally \{[\s\S]*?applyId === couponApplySequence\.current[\s\S]*?setCouponApplying\(false\)/,
  ],
  [
    'Quote requests are guarded against stale responses',
    /quoteRequestSequence = useRef\(0\)/,
  ],
  [
    'Invalid partial email does not destroy the last payment quote',
    /if \(couponCode && email\.trim\(\) && !emailValid\) \{[\s\S]*?setQuoting\(false\);[\s\S]*?return;/,
  ],
  [
    'Coupon can be retried with Enter without changing the field',
    /event\.key === 'Enter' && !couponApplying[\s\S]*?void applyCoupon\(\)/,
  ],
];

let passed = 0;
for (const [label, pattern] of checks) {
  if (!pattern.test(source)) {
    console.error(`✗ ${label}`);
    process.exitCode = 1;
  } else {
    console.log(`✓ ${label}`);
    passed += 1;
  }
}

if (process.exitCode) {
  console.error(`\nCoupon checkout regression verification failed (${passed}/${checks.length}).`);
  process.exit(process.exitCode);
}

console.log(`\nCoupon checkout regression verification passed (${passed}/${checks.length}).`);
