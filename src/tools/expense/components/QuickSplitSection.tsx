import { useMemo } from 'react';
import { ReceiptText, RotateCcw } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { TextInputControls } from '@/components/TextInputControls';
import { ActionBar, MetricsGrid } from '@/components/ToolLayout';
import type { ToolMetric } from '@/components/ToolLayout';
import { ToolSection } from '@/components/ToolSection';
import { ToolbarButton } from '@/components/ToolbarButton';
import { formatMoney } from '@/utils/numberFormat';
import type { calculateQuickSplit } from '../expenseUtils';

type QuickSplitSectionProps = {
  currency: string;
  detailedTotal: number;
  quickPeople: string;
  quickResult: ReturnType<typeof calculateQuickSplit>;
  quickTotal: string;
  onCurrencyChange: (value: string) => void;
  onQuickPeopleChange: (value: string) => void;
  onQuickTotalChange: (value: string) => void;
  onResetSample: () => void;
  onUseDetailedTotal: () => void;
};

function QuickSplitSection({
  currency,
  detailedTotal,
  quickPeople,
  quickResult,
  quickTotal,
  onCurrencyChange,
  onQuickPeopleChange,
  onQuickTotalChange,
  onResetSample,
  onUseDetailedTotal,
}: QuickSplitSectionProps) {
  const quickSummary = useMemo(
    () =>
      [
        `Total: ${formatMoney(quickResult.total, currency)}`,
        `People: ${quickResult.people}`,
        `Each pays: ${formatMoney(quickResult.each, currency)}`,
      ].join('\n'),
    [currency, quickResult],
  );
  const quickMetricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Total', value: formatMoney(quickResult.total, currency) },
      { label: 'People', value: quickResult.people },
      { label: 'Each pays', value: formatMoney(quickResult.each, currency) },
      { label: 'Mode', value: 'Equal split' },
    ],
    [currency, quickResult],
  );

  return (
    <ToolSection title="Quick split">
      <TextInputControls
        className="life-controls"
        controls={[
          { label: 'Total', value: quickTotal, onChange: onQuickTotalChange },
          { label: 'People', value: quickPeople, onChange: onQuickPeopleChange },
          { label: 'Currency', value: currency, onChange: onCurrencyChange },
        ]}
      />
      <MetricsGrid items={quickMetricsItems} />
      <ActionBar>
        <ToolbarButton title={`Use detailed total ${formatMoney(detailedTotal, currency)} for quick split`} icon={<ReceiptText size={16} />} label="Use detailed total" onClick={onUseDetailedTotal} />
        <ToolbarButton title="Reset sample" icon={<RotateCcw size={16} />} label="Sample" onClick={onResetSample} />
        <CopyButton title="Copy quick split" value={quickSummary} label="Copy quick split" />
      </ActionBar>
    </ToolSection>
  );
}

export { QuickSplitSection };
