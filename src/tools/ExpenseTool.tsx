import { useMemo, useState } from 'react';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { DetailedSplitSection } from './expense/components/DetailedSplitSection';
import { QuickSplitSection } from './expense/components/QuickSplitSection';
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

  const modeContent = {
    quick: (
      <QuickSplitSection
        currency={currency}
        detailedTotal={result.total}
        quickPeople={quickPeople}
        quickResult={quickResult}
        quickTotal={quickTotal}
        onCurrencyChange={setCurrency}
        onQuickPeopleChange={setQuickPeople}
        onQuickTotalChange={setQuickTotal}
        onResetSample={resetSample}
        onUseDetailedTotal={() => setQuickTotal(result.total.toFixed(2))}
      />
    ),
    detailed: (
      <DetailedSplitSection
        amount={amount}
        currency={currency}
        extraFee={extraFee}
        participants={participants}
        result={result}
        taxPercent={taxPercent}
        tipPercent={tipPercent}
        onAddParticipant={addParticipant}
        onAmountChange={setAmount}
        onExtraFeeChange={setExtraFee}
        onRemoveParticipant={removeParticipant}
        onResetSample={resetSample}
        onTaxPercentChange={setTaxPercent}
        onTipPercentChange={setTipPercent}
        onUpdateParticipant={updateParticipant}
      />
    ),
  };

  return (
    <section className="tool-surface">
      <SegmentedTabs ariaLabel="Split mode" options={splitModeOptions} value={mode} onChange={setMode} />
      {modeContent[mode]}
    </section>
  );
}

export { ExpenseTool };
