import { readNumber } from '../../utils/numberFormat';

type DiscountInput = {
  originalPrice: string;
  discountPercent: string;
  couponAmount: string;
  taxPercent: string;
};

const discountDefaults = {
  originalPrice: '1299',
  discountPercent: '20',
  couponAmount: '100',
  taxPercent: '5',
  currency: '$',
};

function calculateDiscount(input: DiscountInput) {
  const original = Math.max(0, readNumber(input.originalPrice));
  const discountRate = Math.max(0, readNumber(input.discountPercent)) / 100;
  const coupon = Math.max(0, readNumber(input.couponAmount));
  const taxRate = Math.max(0, readNumber(input.taxPercent)) / 100;
  const percentDiscount = original * discountRate;
  const subtotal = Math.max(0, original - percentDiscount - coupon);
  const tax = subtotal * taxRate;
  const finalPrice = subtotal + tax;
  const saved = Math.max(0, original - subtotal);
  const effectiveDiscount = original > 0 ? (saved / original) * 100 : 0;

  return { original, percentDiscount, coupon, subtotal, tax, finalPrice, saved, effectiveDiscount };
}

export { calculateDiscount, discountDefaults };
