import { useMemo, useState } from 'react';
import { Plus, ReceiptText, RotateCcw, Trash2 } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import { formatMoney, readNumber } from '../utils/numberFormat';
import { calculateDetailedSplit, calculateQuickSplit, defaultParticipants, splitModeOptions, type Participant, type SplitMode } from './expense/expenseUtils';

function ExpenseTool() {
  const [mode, setMode] = useState<SplitMode>('quick');
  const [quickTotal, setQuickTotal] = useState('1500');
  const [quickPeople, setQuickPeople] = useState('4');
  const [amount, setAmount] = useState('1280');
  const [taxPercent, setTaxPercent] = useState('5');
  const [tipPercent, setTipPercent] = useState('10');
  const [extraFee, setExtraFee] = useState('0');
  const [currency, setCurrency] = useState('$');
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
    setQuickTotal('1500');
    setQuickPeople('4');
    setAmount('1280');
    setTaxPercent('5');
    setTipPercent('10');
    setExtraFee('0');
    setCurrency('$');
    setParticipants(defaultParticipants);
  }

  return (
    <section className="tool-surface">
      <SegmentedTabs ariaLabel="Split mode" options={splitModeOptions} value={mode} onChange={setMode} />

      {mode === 'quick' ? (
        <ToolSection title="Quick split">
          <div className="inline-controls wide life-controls">
            <TextInputField label="Total" value={quickTotal} onChange={setQuickTotal} compact />
            <TextInputField label="People" value={quickPeople} onChange={setQuickPeople} compact />
            <TextInputField label="Currency" value={currency} onChange={setCurrency} compact />
          </div>
          <MetricsGrid
            items={[
              { label: 'Total', value: formatMoney(quickResult.total, currency) },
              { label: 'People', value: quickResult.people },
              { label: 'Each pays', value: formatMoney(quickResult.each, currency) },
              { label: 'Mode', value: 'Equal split' },
            ]}
          />
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
            <div className="inline-controls wide expense-controls">
              <TextInputField label="Subtotal" value={amount} onChange={setAmount} compact />
              <TextInputField label="Tax %" value={taxPercent} onChange={setTaxPercent} compact />
              <TextInputField label="Tip %" value={tipPercent} onChange={setTipPercent} compact />
              <TextInputField label="Extra fee" value={extraFee} onChange={setExtraFee} compact />
            </div>
          </ToolSection>

          <ToolSection title="People">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Shares</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((participant) => (
                    <tr key={participant.id}>
                      <td>
                        <input value={participant.name} onChange={(event) => updateParticipant(participant.id, 'name', event.target.value)} />
                      </td>
                      <td>
                        <input value={participant.shares} onChange={(event) => updateParticipant(participant.id, 'shares', event.target.value)} />
                      </td>
                      <td>{formatMoney(participant.amount, currency)}</td>
                      <td>
                        <button className="icon-button" type="button" title="Remove person" onClick={() => removeParticipant(participant.id)} disabled={participants.length <= 1}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <MetricsGrid
              items={[
                { label: 'Subtotal', value: formatMoney(result.baseAmount, currency) },
                { label: 'Tax', value: formatMoney(result.tax, currency) },
                { label: 'Tip', value: formatMoney(result.tip, currency) },
                { label: 'Extra', value: formatMoney(result.extra, currency) },
                { label: 'Total', value: formatMoney(result.total, currency) },
                { label: 'Per share', value: formatMoney(result.perShare, currency) },
                { label: 'People', value: participants.length },
                { label: 'Shares', value: result.totalShares || '-' },
              ]}
            />
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
