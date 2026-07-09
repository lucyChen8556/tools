import { useMemo } from 'react';
import { ArrowDownUp, Repeat2 } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { EmptyState } from '@/components/EmptyState';
import { SelectField } from '@/components/SelectField';
import { TextAreaField } from '@/components/TextAreaField';
import { ActionBar, MetricsGrid } from '@/components/ToolLayout';
import type { ToolMetric } from '@/components/ToolLayout';
import { ToolbarButton } from '@/components/ToolbarButton';
import { jsonMergeModeOptions } from '@/config/options';
import type { JsonDiff, JsonMergeMode } from '@/types';
import { compactJson, pathLabel } from '../jsonUtils';

type JsonCompareState = {
  diffs: JsonDiff[];
  leftSorted: string;
  rightSorted: string;
  error: string;
};

type JsonCompareSectionProps = {
  compareState: JsonCompareState;
  jsonResult: string;
  mergeMode: JsonMergeMode;
  onJsonResultChange: (value: string) => void;
  onMerge: () => void;
  onMergeModeChange: (value: JsonMergeMode) => void;
  onSwap: () => void;
};

function JsonCompareSection({
  compareState,
  jsonResult,
  mergeMode,
  onJsonResultChange,
  onMerge,
  onMergeModeChange,
  onSwap,
}: JsonCompareSectionProps) {
  const compareMetricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Changed', value: compareState.diffs.filter((diff) => diff.type === 'changed').length },
      { label: 'Added', value: compareState.diffs.filter((diff) => diff.type === 'added').length },
      { label: 'Removed', value: compareState.diffs.filter((diff) => diff.type === 'removed').length },
      { label: 'Total', value: compareState.diffs.length },
    ],
    [compareState.diffs],
  );

  return (
    <>
      <ActionBar>
        <SelectField label="Merge" value={mergeMode} options={jsonMergeModeOptions} onChange={onMergeModeChange} />
        <ToolbarButton title="Create merged JSON" variant="primary" icon={<Repeat2 size={16} />} label="Merge" onClick={onMerge} />
        <ToolbarButton title="Swap inputs" icon={<ArrowDownUp size={16} />} label="Swap" onClick={onSwap} />
        <CopyButton title="Copy result" value={jsonResult} />
      </ActionBar>

      <MetricsGrid items={compareMetricsItems} />
      <div className="diff-list">
        {compareState.diffs.length === 0 ? (
          <EmptyState>No differences</EmptyState>
        ) : (
          compareState.diffs.slice(0, 80).map((diff, index) => (
            <div className={`diff-row ${diff.type}`} key={`${pathLabel(diff.path)}-${index}`}>
              <strong>{pathLabel(diff.path)}</strong>
              <span>{diff.type}</span>
              <code>{compactJson(diff.before)}</code>
              <code>{compactJson(diff.after)}</code>
            </div>
          ))
        )}
      </div>

      {jsonResult ? (
        <TextAreaField label="Result" value={jsonResult} onChange={onJsonResultChange} spellCheck={false} className="result-output" />
      ) : null}
    </>
  );
}

export { JsonCompareSection };
export type { JsonCompareState };
