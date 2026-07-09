import { useMemo, useState } from 'react';
import { Plus, ReceiptText, RotateCcw, Trash2 } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { DataTable } from '../components/DataTable';
import type { DataTableColumn } from '../components/DataTable';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { TextInputControls } from '../components/TextInputControls';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import { formatMoney, readNumber } from '../utils/numberFormat';
import {
  calculateDetailedSplit,
  calculateQuickSplit,
  defaultParticipants,
  expenseDefaults,
  splitModeOptions,
  type Participant,
  type SplitMode,
} from './expense/expenseUtils';

function ExpenseTool() {
  const [mode, setMode] = useState<SplitMode>(expenseDefaults.mode);
  const [quickTotal, setQuickTotal] = useState(expenseDefaults.quickTotal);
  const [quickPeople, setQuickPeople] = useState(expenseDefaults.quickPeople);
  const [amount, setAmount] = useState(expenseDefaults.amount);
  const [taxPercent, setTaxPercent] = useState(expenseDefaults.taxPercent);
  const [tipPercent, setTipPercent] = useState(expenseDefaults.tipPercent);
  const [extraFee, setExtraFee] = useState(expenseDefaults.extraFee);
  const [currency, setCurrency] = useState(expenseDefaults.currency);
  const [participants, setParticipants] = useState<Participant[]>(defaultParticipants);

  const quickResult = useMemo(() => {
    return calculateQuickSplit(quickTotal, quickPeople);
  }, [quickPeople, quickTotal]);

  const result = useMemo(() => {
    return calculateDetailedSplit({ amount, extraFee, participants, taxPercent, tipPercent });
  }, [amount, extraFee, participants, taxPercent, tipPercent]);

  const summary = [
    `Subtotal: ${formatMoney(result.baseAmount, currency)}`,
    `Tax: ${formatMoney(result.tax, currency)}`,
    `Tip: ${formatMoney(result.tip, currency)}`,
    `Extra: ${formatMoney(result.extra, currency)}`,
    `Total: ${formatMoney(result.total, currency)}`,
    '',
    ...result.rows.map((row) => `${row.name || 'Unnamed'} (${row.numericShares} share${row.numericShares === 1 ? '' : 's'}): ${formatMoney(row.amount, currency)}`),
  ].join('\n');
  const quickSummary = [
    `Total: ${formatMoney(quickResult.total, currency)}`,
    `People: ${quickResult.people}`,
    `Each pays: ${formatMoney(quickResult.each, currency)}`,
  ].join('\n');
  const quickMetricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Total', value: formatMoney(quickResult.total, currency) },
      { label: 'People', value: quickResult.people },
      { label: 'Each pays', value: formatMoney(quickResult.each, currency) },
      { label: 'Mode', value: 'Equal split' },
    ],
    [currency, quickResult],
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

  function updateParticipant(id: string, field: 'name' | 'shares', value: string) {
    setParticipants((current) => current.map((participant) => (participant.id === id ? { ...participant, [field]: value } : participant)));
  }

  function addParticipant() {
    setParticipants((current) => [...current, { id: `${Date.now()}-${current.length}`, name: `Person ${current.length + 1}`, shares: '1' }]);
  }

  function removeParticipant(id: string) {
    setParticipants((current) => current.filter((participant) => participant.id !== id));
  }

  function resetSample() {
    setMode(expenseDefaults.mode);
    setQuickTotal(expenseDefaults.quickTotal);
    setQuickPeople(expenseDefaults.quickPeople);
    setAmount(expenseDefaults.amount);
    setTaxPercent(expenseDefaults.taxPercent);
    setTipPercent(expenseDefaults.tipPercent);
    setExtraFee(expenseDefaults.extraFee);
    setCurrency(expenseDefaults.currency);
    setParticipants(defaultParticipants);
  }

  const participantColumns: Array<DataTableColumn<(typeof result.rows)[number]>> = [
    {
      key: 'name',
      header: 'Name',
      cell: (participant) => (
        <input value={participant.name} onChange={(event) => updateParticipant(participant.id, 'name', event.target.value)} />
      ),
    },
    {
      key: 'shares',
      header: 'Shares',
      cell: (participant) => (
        <input value={participant.shares} onChange={(event) => updateParticipant(participant.id, 'shares', event.target.value)} />
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
        <button className="icon-button" type="button" title="Remove person" onClick={() => removeParticipant(participant.id)} disabled={participants.length <= 1}>
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <section className="tool-surface">
      <SegmentedTabs ariaLabel="Split mode" options={splitModeOptions} value={mode} onChange={setMode} />

      {mode === 'quick' ? (
        <ToolSection title="Quick split">
          <TextInputControls
            className="life-controls"
            controls={[
              { label: 'Total', value: quickTotal, onChange: setQuickTotal },
              { label: 'People', value: quickPeople, onChange: setQuickPeople },
              { label: 'Currency', value: currency, onChange: setCurrency },
            ]}
          />
          <MetricsGrid items={quickMetricsItems} />
          <ActionBar>
            <ToolbarButton title="Use detailed total for quick split" onClick={() => setQuickTotal(result.total.toFixed(2))}>
              <ReceiptText size={16} />
              <span>Use detailed total</span>
            </ToolbarButton>
            <ToolbarButton title="Reset sample" onClick={resetSample}>
              <RotateCcw size={16} />
              <span>Sample</span>
            </ToolbarButton>
            <CopyButton title="Copy quick split" value={quickSummary} label="Copy quick split" />
          </ActionBar>
        </ToolSection>
      ) : (
        <>
          <ToolSection title="Bill">
            <TextInputControls
              className="expense-controls"
              controls={[
                { label: 'Subtotal', value: amount, onChange: setAmount },
                { label: 'Tax %', value: taxPercent, onChange: setTaxPercent },
                { label: 'Tip %', value: tipPercent, onChange: setTipPercent },
                { label: 'Extra fee', value: extraFee, onChange: setExtraFee },
              ]}
            />
          </ToolSection>

          <ToolSection title="People">
            <DataTable columns={participantColumns} rows={result.rows} getRowKey={(participant) => participant.id} />
            <ActionBar>
              <ToolbarButton title="Add person" variant="primary" onClick={addParticipant}>
                <Plus size={16} />
                <span>Add person</span>
              </ToolbarButton>
              <ToolbarButton title="Reset sample" onClick={resetSample}>
                <RotateCcw size={16} />
                <span>Sample</span>
              </ToolbarButton>
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
      )}
    </section>
  );
}

export { ExpenseTool };
