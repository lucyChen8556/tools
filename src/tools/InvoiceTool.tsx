import { useMemo, useState } from 'react';
import { ReceiptText, RotateCcw } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { SelectField } from '../components/SelectField';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import { invoiceRoundingOptions, type InvoiceRoundingMode } from '../config/options';
import { formatMoney, formatNumber, readNumber } from '../utils/numberFormat';
import { calculateInvoice, formatSignedMoney, invoiceDefaults } from './invoice/invoiceUtils';

function InvoiceTool() {
  const [subtotal, setSubtotal] = useState(invoiceDefaults.subtotal);
  const [discountPercent, setDiscountPercent] = useState(invoiceDefaults.discountPercent);
  const [discountAmount, setDiscountAmount] = useState(invoiceDefaults.discountAmount);
  const [servicePercent, setServicePercent] = useState(invoiceDefaults.servicePercent);
  const [taxPercent, setTaxPercent] = useState(invoiceDefaults.taxPercent);
  const [paidAmount, setPaidAmount] = useState(invoiceDefaults.paidAmount);
  const [currency, setCurrency] = useState(invoiceDefaults.currency);
  const [roundingMode, setRoundingMode] = useState<InvoiceRoundingMode>(invoiceDefaults.roundingMode);

  const result = useMemo(() => {
    return calculateInvoice({ discountAmount, discountPercent, paidAmount, roundingMode, servicePercent, subtotal, taxPercent });
  }, [discountAmount, discountPercent, paidAmount, roundingMode, servicePercent, subtotal, taxPercent]);

  const metricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Subtotal', value: formatMoney(result.subtotal, currency) },
      { label: 'Discount', value: `-${formatMoney(result.discount, currency)}` },
      { label: 'Service', value: formatMoney(result.service, currency) },
      { label: 'Tax', value: formatMoney(result.tax, currency) },
      { label: 'Before rounding', value: formatMoney(result.beforeRounding, currency) },
      { label: 'Adjustment', value: formatSignedMoney(result.adjustment, currency) },
      { label: 'Total due', value: formatMoney(result.total, currency) },
      { label: result.balance > 0 ? 'Balance' : 'Change', value: formatMoney(result.balance > 0 ? result.balance : result.change, currency) },
    ],
    [currency, result],
  );

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
    setSubtotal(invoiceDefaults.subtotal);
    setDiscountPercent(invoiceDefaults.discountPercent);
    setDiscountAmount(invoiceDefaults.discountAmount);
    setServicePercent(invoiceDefaults.servicePercent);
    setTaxPercent(invoiceDefaults.taxPercent);
    setPaidAmount(invoiceDefaults.paidAmount);
    setCurrency(invoiceDefaults.currency);
    setRoundingMode(invoiceDefaults.roundingMode);
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
        <MetricsGrid items={metricsItems} />
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
