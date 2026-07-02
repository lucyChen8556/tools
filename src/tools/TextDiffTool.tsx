import { useMemo, useState } from 'react';
import { CheckboxControl } from '../components/CheckboxControl';
import { CopyButton } from '../components/CopyButton';
import { Stat } from '../components/Stat';
import { TextAreaField } from '../components/TextAreaField';
import { diffLines } from '../utils/textDiff';

function TextDiffTool() {
  const [oldText, setOldText] = useState('Release note: Fixed login timeout.\nEmail title: Welcome back');
  const [newText, setNewText] = useState('Release note: Fixed session timeout.\nEmail title: Welcome back\nCTA: Continue');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const diffs = useMemo(() => diffLines(oldText, newText, ignoreWhitespace), [oldText, newText, ignoreWhitespace]);
  const added = diffs.filter((diff) => diff.type === 'added').length;
  const removed = diffs.filter((diff) => diff.type === 'removed').length;
  const changed = diffs.filter((diff) => diff.type === 'changed').length;
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
      <div className="split-editor">
        <TextAreaField label="Before" value={oldText} onChange={setOldText} />
        <TextAreaField label="After" value={newText} onChange={setNewText} />
      </div>
      <div className="action-bar">
        <CheckboxControl label="Ignore whitespace" checked={ignoreWhitespace} onChange={setIgnoreWhitespace} />
        <CopyButton title="Copy diff" value={diffText} />
      </div>
      <div className="metrics-row">
        <Stat label="Changed" value={changed} />
        <Stat label="Added" value={added} />
        <Stat label="Removed" value={removed} />
        <Stat label="Lines" value={diffs.length} />
      </div>
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
