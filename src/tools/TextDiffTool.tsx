import { useMemo, useState } from 'react';
import { CheckboxControl } from '@/components/CheckboxControl';
import { CopyButton } from '@/components/CopyButton';
import { ActionBar, MetricsGrid, SplitTextAreas } from '@/components/ToolLayout';
import type { ToolMetric } from '@/components/ToolLayout';
import { diffLines, textDiffDefaults } from './textDiff/textDiffUtils';

function TextDiffTool() {
  const [oldText, setOldText] = useState(textDiffDefaults.oldText);
  const [newText, setNewText] = useState(textDiffDefaults.newText);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(textDiffDefaults.ignoreWhitespace);
  const diffs = useMemo(() => diffLines(oldText, newText, ignoreWhitespace), [oldText, newText, ignoreWhitespace]);
  const added = diffs.filter((diff) => diff.type === 'added').length;
  const removed = diffs.filter((diff) => diff.type === 'removed').length;
  const changed = diffs.filter((diff) => diff.type === 'changed').length;
  const metricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Changed', value: changed },
      { label: 'Added', value: added },
      { label: 'Removed', value: removed },
      { label: 'Lines', value: diffs.length },
    ],
    [added, changed, diffs.length, removed],
  );
  const diffText = diffs
    .map((diff) => {
      if (diff.type === 'same') return `  ${diff.oldText ?? ''}`;
      if (diff.type === 'added') return `+ ${diff.newText ?? ''}`;
      if (diff.type === 'removed') return `- ${diff.oldText ?? ''}`;
      return `- ${diff.oldText ?? ''}\n+ ${diff.newText ?? ''}`;
    })
    .join('\n');

  return (
    <section className="tool-surface">
      <SplitTextAreas left={{ label: 'Before', value: oldText, onChange: setOldText }} right={{ label: 'After', value: newText, onChange: setNewText }} />
      <ActionBar>
        <CheckboxControl label="Ignore whitespace" checked={ignoreWhitespace} onChange={setIgnoreWhitespace} />
        <CopyButton title="Copy diff" value={diffText} />
      </ActionBar>
      <MetricsGrid items={metricsItems} />
      <div className="text-diff-view">
        {diffs.map((diff, index) => (
          <div className={`line-diff ${diff.type}`} key={`${diff.type}-${index}`}>
            <span>{diff.type === 'same' ? ' ' : diff.type === 'added' ? '+' : diff.type === 'removed' ? '-' : '~'}</span>
            {diff.type === 'changed' ? (
              <div>
                <del>{diff.oldText}</del>
                <ins>{diff.newText}</ins>
              </div>
            ) : (
              <code>{diff.oldText ?? diff.newText}</code>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
export { TextDiffTool };
