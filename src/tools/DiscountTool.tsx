import { useMemo, useState } from 'react';
import { ReceiptText, RotateCcw } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import { formatMoney, formatNumber } from '../utils/numberFormat';
import { calculateDiscount } from './discount/discountUtils';

function DiscountTool() {
  const [originalPrice, setOriginalPrice] = useState('1299');
  const [discountPercent, setDiscountPercent] = useState('20');
  const [couponAmount, setCouponAmount] = useState('100');
  const [taxPercent, setTaxPercent] = useState('5');
  const [currency, setCurrency] = useState('$');

  const result = useMemo(() => {
    return calculateDiscount({ couponAmount, discountPercent, originalPrice, taxPercent });
  }, [couponAmount, discountPercent, originalPrice, taxPercent]);

  const summary = [
    `Original: ${formatMoney(result.original, currency)}`,
    `Discount: ${formatMoney(result.percentDiscount, currency)} (${discountPercent}%)`,
    `Coupon: ${formatMoney(result.coupon, currency)}`,
    `Before tax: ${formatMoney(result.subtotal, currency)}`,
    `Tax: ${formatMoney(result.tax, currency)}`,
    `Final: ${formatMoney(result.finalPrice, currency)}`,
    `Saved: ${formatMoney(result.saved, currency)} (${formatNumber(result.effectiveDiscount)}%)`,
  ].join('\n');

  function resetSample() {
    setOriginalPrice('1299');
    setDiscountPercent('20');
    setCouponAmount('100');
    setTaxPercent('5');
    setCurrency('$');
  }

  return (
    <section className="tool-surface">
      <ToolSection title="Discount">
        <div className="inline-controls wide life-controls">
          <TextInputField label="Original price" value={originalPrice} onChange={setOriginalPrice} compact />
          <TextInputField label="Discount %" value={discountPercent} onChange={setDiscountPercent} compact />
          <TextInputField label="Coupon amount" value={couponAmount} onChange={setCouponAmount} compact />
          <TextInputField label="Tax %" value={taxPercent} onChange={setTaxPercent} compact />
          <TextInputField label="Currency" value={currency} onChange={setCurrency} compact />
        </div>
      </ToolSection>

      <ToolSection title="Result">
        <MetricsGrid
          items={[
            { label: 'Original', value: formatMoney(result.original, currency) },
            { label: 'Discount', value: formatMoney(result.percentDiscount, currency) },
            { label: 'Coupon', value: formatMoney(result.coupon, currency) },
            { label: 'Before tax', value: formatMoney(result.subtotal, currency) },
            { label: 'Tax', value: formatMoney(result.tax, currency) },
            { label: 'Final price', value: formatMoney(result.finalPrice, currency) },
            { label: 'Saved', value: formatMoney(result.saved, currency) },
            { label: 'Effective off', value: `${formatNumber(result.effectiveDiscount)}%` },
          ]}
        />
        <ActionBar>
          <ToolbarButton title="Reset sample" variant="primary" onClick={resetSample}>
            <RotateCcw size={16} />
            <span>Sample</span>
          </ToolbarButton>
          <CopyButton title="Copy discount summary" value={summary} label="Copy summary" />
        </ActionBar>
        <div className="notice warning">
          <ReceiptText size={16} />
          <span>Tax is calculated after percent discount and coupon amount.</span>
        </div>
      </ToolSection>
    </section>
  );
}

export { DiscountTool };
