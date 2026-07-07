import { useMemo, useState } from 'react';
import { ReceiptText, RotateCcw } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { SelectField } from '../components/SelectField';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import { invoiceRoundingOptions, type InvoiceRoundingMode } from '../config/options';
import { formatMoney, formatNumber, readNumber } from '../utils/numberFormat';
import { calculateInvoice, formatSignedMoney } from './invoice/invoiceUtils';

function InvoiceTool() {
  const [subtotal, setSubtotal] = useState('1200');
  const [discountPercent, setDiscountPercent] = useState('10');
  const [discountAmount, setDiscountAmount] = useState('0');
  const [servicePercent, setServicePercent] = useState('10');
  const [taxPercent, setTaxPercent] = useState('5');
  const [paidAmount, setPaidAmount] = useState('1500');
  const [currency, setCurrency] = useState('$');
  const [roundingMode, setRoundingMode] = useState<InvoiceRoundingMode>('nearest-1');

  const result = useMemo(() => {
    return calculateInvoice({ discountAmount, discountPercent, paidAmount, roundingMode, servicePercent, subtotal, taxPercent });
  }, [discountAmount, discountPercent, paidAmount, roundingMode, servicePercent, subtotal, taxPercent]);

  const summary = [
    `Subtotal: ${formatMoney(result.subtotal, currency)}`,
    `Discount: -${formatMoney(result.discount, currency)} (${formatNumber(result.effectiveDiscount)}%)`,
    `After discount: ${formatMoney(result.afterDiscount, currency)}`,
    `Service: ${formatMoney(result.service, currency)} (${formatNumber(readNumber(servicePercent))}%)`,
    `Tax: ${formatMoney(result.tax, currency)} (${formatNumber(readNumber(taxPercent))}%)`,
    `Before rounding: ${formatMoney(result.beforeRounding, currency)}`,
    `Rounding adjustment: ${formatSignedMoney(result.adjustment, currency)}`,
    `Total due: ${formatMoney(result.total, currency)}`,
    `Paid: ${formatMoney(result.paid, currency)}`,
    result.balance > 0 ? `Balance: ${formatMoney(result.balance, currency)}` : `Change: ${formatMoney(result.change, currency)}`,
  ].join('\n');

  function resetSample() {
    setSubtotal('1200');
    setDiscountPercent('10');
    setDiscountAmount('0');
    setServicePercent('10');
    setTaxPercent('5');
    setPaidAmount('1500');
    setCurrency('$');
    setRoundingMode('nearest-1');
  }

  return (
    <section className="tool-surface">
      <ToolSection title="Invoice">
        <div className="inline-controls wide invoice-controls">
          <TextInputField label="Subtotal" value={subtotal} onChange={setSubtotal} compact />
          <TextInputField label="Discount %" value={discountPercent} onChange={setDiscountPercent} compact />
          <TextInputField label="Discount amount" value={discountAmount} onChange={setDiscountAmount} compact />
          <TextInputField label="Service %" value={servicePercent} onChange={setServicePercent} compact />
          <TextInputField label="Tax %" value={taxPercent} onChange={setTaxPercent} compact />
          <TextInputField label="Paid" value={paidAmount} onChange={setPaidAmount} compact />
          <TextInputField label="Currency" value={currency} onChange={setCurrency} compact />
          <SelectField label="Rounding" value={roundingMode} options={invoiceRoundingOptions} onChange={setRoundingMode} />
        </div>
      </ToolSection>

      <ToolSection title="Receipt">
        <MetricsGrid
          items={[
            { label: 'Subtotal', value: formatMoney(result.subtotal, currency) },
            { label: 'Discount', value: `-${formatMoney(result.discount, currency)}` },
            { label: 'Service', value: formatMoney(result.service, currency) },
            { label: 'Tax', value: formatMoney(result.tax, currency) },
            { label: 'Before rounding', value: formatMoney(result.beforeRounding, currency) },
            { label: 'Adjustment', value: formatSignedMoney(result.adjustment, currency) },
            { label: 'Total due', value: formatMoney(result.total, currency) },
            { label: result.balance > 0 ? 'Balance' : 'Change', value: formatMoney(result.balance > 0 ? result.balance : result.change, currency) },
          ]}
        />
        <ActionBar>
          <ToolbarButton title="Reset sample" variant="primary" onClick={resetSample}>
            <RotateCcw size={16} />
            <span>Sample</span>
          </ToolbarButton>
          <CopyButton title="Copy invoice summary" value={summary} label="Copy summary" />
        </ActionBar>
        <div className="notice warning">
          <ReceiptText size={16} />
          <span>Tax is calculated after discount and service charge.</span>
        </div>
      </ToolSection>
    </section>
  );
}

export { InvoiceTool };
