import { useMemo, useState } from 'react';
import { CheckboxControl } from '@/components/CheckboxControl';
import { CopyButton } from '@/components/CopyButton';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { ActionBar, MetricsGrid, SplitTextAreas } from '@/components/ToolLayout';
import type { ToolMetric } from '@/components/ToolLayout';
import { TextDiffLinesView } from './textDiff/components/TextDiffLinesView';
import { TextDiffOnlyView } from './textDiff/components/TextDiffOnlyView';
import {
  diffLines,
  formatOnlyInSides,
  getOnlyInSides,
  textDiffDefaults,
  textDiffViewOptions,
  type TextDiffView,
} from './textDiff/textDiffUtils';

function TextDiffTool() {
  const [oldText, setOldText] = useState(textDiffDefaults.oldText);
  const [newText, setNewText] = useState(textDiffDefaults.newText);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(textDiffDefaults.ignoreWhitespace);
  const [view, setView] = useState<TextDiffView>(textDiffDefaults.view);
  const diffs = useMemo(() => diffLines(oldText, newText, ignoreWhitespace), [oldText, newText, ignoreWhitespace]);
  const onlyInSides = useMemo(() => getOnlyInSides(oldText, newText, ignoreWhitespace), [ignoreWhitespace, newText, oldText]);
  const added = diffs.filter((diff) => diff.type === 'added').length;
  const removed = diffs.filter((diff) => diff.type === 'removed').length;
  const changed = diffs.filter((diff) => diff.type === 'changed').length;
  const metricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Changed', value: changed },
      { label: 'Added', value: added },
      { label: 'Removed', value: removed },
      { label: 'Before only', value: onlyInSides.onlyInA.length },
      { label: 'After only', value: onlyInSides.onlyInB.length },
      { label: 'Lines', value: diffs.length },
    ],
    [added, changed, diffs.length, onlyInSides.onlyInA.length, onlyInSides.onlyInB.length, removed],
  );
  const diffText = diffs
    .map((diff) => {
      if (diff.type === 'same') return `  ${diff.oldText ?? ''}`;
      if (diff.type === 'added') return `+ ${diff.newText ?? ''}`;
      if (diff.type === 'removed') return `- ${diff.oldText ?? ''}`;
      return `- ${diff.oldText ?? ''}\n+ ${diff.newText ?? ''}`;
    })
    .join('\n');
  const onlyText = useMemo(() => formatOnlyInSides(onlyInSides.onlyInA, onlyInSides.onlyInB), [onlyInSides]);
  const viewContent = {
    diff: <TextDiffLinesView diffs={diffs} />,
    only: <TextDiffOnlyView onlyInA={onlyInSides.onlyInA} onlyInB={onlyInSides.onlyInB} />,
  };

  return (
    <section className="tool-surface">
      <SplitTextAreas left={{ label: 'Before', value: oldText, onChange: setOldText }} right={{ label: 'After', value: newText, onChange: setNewText }} />
      <ActionBar>
        <CheckboxControl label="Ignore whitespace" checked={ignoreWhitespace} onChange={setIgnoreWhitespace} />
        <SegmentedTabs compact ariaLabel="Text diff view" options={textDiffViewOptions} value={view} onChange={setView} />
        <CopyButton title={view === 'only' ? 'Copy only values' : 'Copy diff'} value={view === 'only' ? onlyText : diffText} />
      </ActionBar>
      <MetricsGrid items={metricsItems} />
      {viewContent[view]}
    </section>
  );
}
export { TextDiffTool };
