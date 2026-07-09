import type { DiffOp } from '@/types';

type TextDiffLinesViewProps = {
  diffs: DiffOp[];
};

function getDiffMarker(type: DiffOp['type']) {
  if (type === 'same') return ' ';
  if (type === 'added') return '+';
  if (type === 'removed') return '-';
  return '~';
}

function TextDiffLinesView({ diffs }: TextDiffLinesViewProps) {
  return (
    <div className="text-diff-view">
      {diffs.map((diff, index) => (
        <div className={`line-diff ${diff.type}`} key={`${diff.type}-${index}`}>
          <span>{getDiffMarker(diff.type)}</span>
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
  );
}

export { TextDiffLinesView };
