import type { InvoiceRoundingMode } from '@/config/options';
import { formatMoney, readNumber } from '@/utils/numberFormat';

type InvoiceInput = {
  subtotal: string;
  discountPercent: string;
  discountAmount: string;
  servicePercent: string;
  taxPercent: string;
  paidAmount: string;
  roundingMode: InvoiceRoundingMode;
};

const invoiceDefaults = {
  subtotal: '1200',
  discountPercent: '10',
  discountAmount: '0',
  servicePercent: '10',
  taxPercent: '5',
  paidAmount: '1500',
  currency: '$',
  roundingMode: 'nearest-1' as InvoiceRoundingMode,
};

function roundTo(value: number, unit: number) {
  return Math.round(value / unit) * unit;
}

function applyRounding(value: number, mode: InvoiceRoundingMode) {
  if (mode === 'nearest-1') return Math.round(value);
  if (mode === 'nearest-5') return roundTo(value, 5);
  if (mode === 'nearest-10') return roundTo(value, 10);
  if (mode === 'up-1') return Math.ceil(value);
  if (mode === 'down-1') return Math.floor(value);
  return value;
}

function formatSignedMoney(value: number, symbol: string) {
  const sign = value < 0 ? '-' : '';
  return `${sign}${formatMoney(Math.abs(value), symbol)}`;
}

function calculateInvoice(input: InvoiceInput) {
  const baseSubtotal = Math.max(0, readNumber(input.subtotal));
  const percentDiscount = baseSubtotal * (Math.max(0, readNumber(input.discountPercent)) / 100);
  const fixedDiscount = Math.max(0, readNumber(input.discountAmount));
  const discount = Math.min(baseSubtotal, percentDiscount + fixedDiscount);
  const afterDiscount = Math.max(0, baseSubtotal - discount);
  const service = afterDiscount * (Math.max(0, readNumber(input.servicePercent)) / 100);
  const taxableAmount = afterDiscount + service;
  const tax = taxableAmount * (Math.max(0, readNumber(input.taxPercent)) / 100);
  const beforeRounding = taxableAmount + tax;
  const total = Math.max(0, applyRounding(beforeRounding, input.roundingMode));
  const paid = Math.max(0, readNumber(input.paidAmount));

  return {
    subtotal: baseSubtotal,
    percentDiscount,
    fixedDiscount,
    discount,
    afterDiscount,
    service,
    taxableAmount,
    tax,
    beforeRounding,
    total,
    adjustment: total - beforeRounding,
    paid,
    change: Math.max(0, paid - total),
    balance: Math.max(0, total - paid),
    effectiveDiscount: baseSubtotal > 0 ? (discount / baseSubtotal) * 100 : 0,
  };
}

export { calculateInvoice, formatSignedMoney, invoiceDefaults };
