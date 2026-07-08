import { useMemo, useState } from 'react';
import { ReceiptText, RotateCcw } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { TextInputControls } from '../components/TextInputControls';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import { formatMoney, formatNumber } from '../utils/numberFormat';
import { calculateDiscount, discountDefaults } from './discount/discountUtils';

function DiscountTool() {
  const [originalPrice, setOriginalPrice] = useState(discountDefaults.originalPrice);
  const [discountPercent, setDiscountPercent] = useState(discountDefaults.discountPercent);
  const [couponAmount, setCouponAmount] = useState(discountDefaults.couponAmount);
  const [taxPercent, setTaxPercent] = useState(discountDefaults.taxPercent);
  const [currency, setCurrency] = useState(discountDefaults.currency);

  const result = useMemo(() => {
    return calculateDiscount({ couponAmount, discountPercent, originalPrice, taxPercent });
  }, [couponAmount, discountPercent, originalPrice, taxPercent]);

  const metricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Original', value: formatMoney(result.original, currency) },
      { label: 'Discount', value: formatMoney(result.percentDiscount, currency) },
      { label: 'Coupon', value: formatMoney(result.coupon, currency) },
      { label: 'Before tax', value: formatMoney(result.subtotal, currency) },
      { label: 'Tax', value: formatMoney(result.tax, currency) },
      { label: 'Final price', value: formatMoney(result.finalPrice, currency) },
      { label: 'Saved', value: formatMoney(result.saved, currency) },
      { label: 'Effective off', value: `${formatNumber(result.effectiveDiscount)}%` },
    ],
    [currency, result],
  );

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
    setOriginalPrice(discountDefaults.originalPrice);
    setDiscountPercent(discountDefaults.discountPercent);
    setCouponAmount(discountDefaults.couponAmount);
    setTaxPercent(discountDefaults.taxPercent);
    setCurrency(discountDefaults.currency);
  }

  return (
    <section className="tool-surface">
      <ToolSection title="Discount">
        <TextInputControls
          className="life-controls"
          controls={[
            { label: 'Original price', value: originalPrice, onChange: setOriginalPrice },
            { label: 'Discount %', value: discountPercent, onChange: setDiscountPercent },
            { label: 'Coupon amount', value: couponAmount, onChange: setCouponAmount },
            { label: 'Tax %', value: taxPercent, onChange: setTaxPercent },
            { label: 'Currency', value: currency, onChange: setCurrency },
          ]}
        />
      </ToolSection>

      <ToolSection title="Result">
        <MetricsGrid items={metricsItems} />
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
