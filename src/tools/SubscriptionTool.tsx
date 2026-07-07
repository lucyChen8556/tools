import { useMemo, useState } from 'react';
import { CalendarDays, RotateCcw } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { SelectField } from '../components/SelectField';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import { formatMoney, formatNumber, readNumber } from '../utils/numberFormat';
import { billingOptions, calculateSubscription, type BillingCycle } from './subscription/subscriptionUtils';

function SubscriptionTool() {
  const [price, setPrice] = useState('19.99');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [seats, setSeats] = useState('3');
  const [splitBy, setSplitBy] = useState('3');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [currency, setCurrency] = useState('$');

  const result = useMemo(() => {
    return calculateSubscription({ billingCycle, discountPercent, price, seats, splitBy });
  }, [billingCycle, discountPercent, price, seats, splitBy]);

  const summary = [
    `Billing: ${billingCycle}`,
    `Seats: ${result.seatCount}`,
    `Split by: ${result.people}`,
    `Monthly total: ${formatMoney(result.monthlyTotal, currency)}`,
    `Yearly total: ${formatMoney(result.yearlyTotal, currency)}`,
    `Monthly per person: ${formatMoney(result.monthlyPerPerson, currency)}`,
    `Daily total: ${formatMoney(result.dailyTotal, currency)}`,
  ].join('\n');

  function resetSample() {
    setPrice('19.99');
    setBillingCycle('monthly');
    setSeats('3');
    setSplitBy('3');
    setDiscountPercent('0');
    setCurrency('$');
  }

  return (
    <section className="tool-surface">
      <ToolSection title="Subscription">
        <div className="inline-controls wide life-controls">
          <TextInputField label="Price" value={price} onChange={setPrice} compact />
          <SelectField label="Billing" value={billingCycle} options={billingOptions} onChange={setBillingCycle} />
          <TextInputField label="Seats" value={seats} onChange={setSeats} compact />
          <TextInputField label="Split by" value={splitBy} onChange={setSplitBy} compact />
          <TextInputField label="Discount %" value={discountPercent} onChange={setDiscountPercent} compact />
          <TextInputField label="Currency" value={currency} onChange={setCurrency} compact />
        </div>
      </ToolSection>

      <ToolSection title="Cost">
        <MetricsGrid
          items={[
            { label: 'This period', value: formatMoney(result.periodTotal, currency) },
            { label: 'Monthly total', value: formatMoney(result.monthlyTotal, currency) },
            { label: 'Yearly total', value: formatMoney(result.yearlyTotal, currency) },
            { label: 'Daily total', value: formatMoney(result.dailyTotal, currency) },
            { label: 'Monthly / person', value: formatMoney(result.monthlyPerPerson, currency) },
            { label: 'Yearly / person', value: formatMoney(result.yearlyPerPerson, currency) },
            { label: 'Monthly / seat', value: formatMoney(result.perSeatMonthly, currency) },
            { label: 'Discount saved', value: `${formatMoney(result.savings, currency)} (${formatNumber(readNumber(discountPercent))}%)` },
          ]}
        />
        <ActionBar>
          <ToolbarButton title="Reset sample" variant="primary" onClick={resetSample}>
            <RotateCcw size={16} />
            <span>Sample</span>
          </ToolbarButton>
          <CopyButton title="Copy subscription summary" value={summary} label="Copy summary" />
        </ActionBar>
        <div className="notice warning">
          <CalendarDays size={16} />
          <span>Yearly values are estimated with 365 days.</span>
        </div>
      </ToolSection>
    </section>
  );
}

export { SubscriptionTool };
