import { useMemo } from 'react';
import { Plus, ReceiptText, RotateCcw, Trash2 } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { DataTable } from '@/components/DataTable';
import type { DataTableColumn } from '@/components/DataTable';
import { TextInputControls } from '@/components/TextInputControls';
import { ActionBar, MetricsGrid } from '@/components/ToolLayout';
import type { ToolMetric } from '@/components/ToolLayout';
import { ToolSection } from '@/components/ToolSection';
import { ToolbarButton } from '@/components/ToolbarButton';
import { formatMoney } from '@/utils/numberFormat';
import type { calculateDetailedSplit, Participant } from '../expenseUtils';

type DetailedSplitSectionProps = {
  amount: string;
  currency: string;
  extraFee: string;
  participants: Participant[];
  result: ReturnType<typeof calculateDetailedSplit>;
  taxPercent: string;
  tipPercent: string;
  onAddParticipant: () => void;
  onAmountChange: (value: string) => void;
  onExtraFeeChange: (value: string) => void;
  onRemoveParticipant: (id: string) => void;
  onResetSample: () => void;
  onTaxPercentChange: (value: string) => void;
  onTipPercentChange: (value: string) => void;
  onUpdateParticipant: (id: string, field: 'name' | 'shares', value: string) => void;
};

function DetailedSplitSection({
  amount,
  currency,
  extraFee,
  participants,
  result,
  taxPercent,
  tipPercent,
  onAddParticipant,
  onAmountChange,
  onExtraFeeChange,
  onRemoveParticipant,
  onResetSample,
  onTaxPercentChange,
  onTipPercentChange,
  onUpdateParticipant,
}: DetailedSplitSectionProps) {
  const summary = useMemo(
    () =>
      [
        `Subtotal: ${formatMoney(result.baseAmount, currency)}`,
        `Tax: ${formatMoney(result.tax, currency)}`,
        `Tip: ${formatMoney(result.tip, currency)}`,
        `Extra: ${formatMoney(result.extra, currency)}`,
        `Total: ${formatMoney(result.total, currency)}`,
        '',
        ...result.rows.map((row) => `${row.name || 'Unnamed'} (${row.numericShares} share${row.numericShares === 1 ? '' : 's'}): ${formatMoney(row.amount, currency)}`),
      ].join('\n'),
    [currency, result],
  );
  const detailedMetricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Subtotal', value: formatMoney(result.baseAmount, currency) },
      { label: 'Tax', value: formatMoney(result.tax, currency) },
      { label: 'Tip', value: formatMoney(result.tip, currency) },
      { label: 'Extra', value: formatMoney(result.extra, currency) },
      { label: 'Total', value: formatMoney(result.total, currency) },
      { label: 'Per share', value: formatMoney(result.perShare, currency) },
      { label: 'People', value: participants.length },
      { label: 'Shares', value: result.totalShares || '-' },
    ],
    [currency, participants.length, result],
  );
  const participantColumns = useMemo<Array<DataTableColumn<(typeof result.rows)[number]>>>(
    () => [
      {
        key: 'name',
        header: 'Name',
        cell: (participant) => (
          <input value={participant.name} onChange={(event) => onUpdateParticipant(participant.id, 'name', event.target.value)} />
        ),
      },
      {
        key: 'shares',
        header: 'Shares',
        cell: (participant) => (
          <input value={participant.shares} onChange={(event) => onUpdateParticipant(participant.id, 'shares', event.target.value)} />
        ),
      },
      {
        key: 'amount',
        header: 'Amount',
        cell: (participant) => formatMoney(participant.amount, currency),
      },
      {
        key: 'action',
        header: 'Action',
        cell: (participant) => (
          <button className="icon-button" type="button" title="Remove person" onClick={() => onRemoveParticipant(participant.id)} disabled={participants.length <= 1}>
            <Trash2 size={15} />
          </button>
        ),
      },
    ],
    [currency, onRemoveParticipant, onUpdateParticipant, participants.length],
  );

  return (
    <>
      <ToolSection title="Bill">
        <TextInputControls
          className="expense-controls"
          controls={[
            { label: 'Subtotal', value: amount, onChange: onAmountChange },
            { label: 'Tax %', value: taxPercent, onChange: onTaxPercentChange },
            { label: 'Tip %', value: tipPercent, onChange: onTipPercentChange },
            { label: 'Extra fee', value: extraFee, onChange: onExtraFeeChange },
          ]}
        />
      </ToolSection>

      <ToolSection title="People">
        <DataTable columns={participantColumns} rows={result.rows} getRowKey={(participant) => participant.id} />
        <ActionBar>
          <ToolbarButton title="Add person" variant="primary" icon={<Plus size={16} />} label="Add person" onClick={onAddParticipant} />
          <ToolbarButton title="Reset sample" icon={<RotateCcw size={16} />} label="Sample" onClick={onResetSample} />
          <CopyButton title="Copy split summary" value={summary} label="Copy summary" />
        </ActionBar>
      </ToolSection>

      <ToolSection title="Summary">
        <MetricsGrid items={detailedMetricsItems} />
        <div className="notice warning">
          <ReceiptText size={16} />
          <span>Shares let one person pay more or less than an equal split.</span>
        </div>
      </ToolSection>
    </>
  );
}

export { DetailedSplitSection };
