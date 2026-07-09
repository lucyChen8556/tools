import { CopyButton } from '@/components/CopyButton';
import { EmptyState } from '@/components/EmptyState';

type TextDiffOnlyViewProps = {
  onlyInA: string[];
  onlyInB: string[];
};

function TextDiffOnlyColumn({
  copyLabel,
  emptyText,
  items,
  marker,
  title,
  type,
}: {
  copyLabel: string;
  emptyText: string;
  items: string[];
  marker: string;
  title: string;
  type: 'removed' | 'added';
}) {
  const copyValue = items.join('\n');

  return (
    <section className="text-diff-only-column" aria-label={title}>
      <div className="text-diff-only-heading">
        <strong>{title}</strong>
        <div className="text-diff-only-actions">
          <span>{items.length}</span>
          <CopyButton title={`Copy ${title} values`} value={copyValue} label={copyLabel} />
        </div>
      </div>
      {items.length === 0 ? (
        <EmptyState compact>{emptyText}</EmptyState>
      ) : (
        <div className="text-diff-only-list">
          {items.map((item, index) => (
            <div className={`line-diff ${type}`} key={`${type}-${item}-${index}`}>
              <span>{marker}</span>
              <code>{item}</code>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function TextDiffOnlyView({ onlyInA, onlyInB }: TextDiffOnlyViewProps) {
  return (
    <div className="text-diff-only-grid">
      <TextDiffOnlyColumn copyLabel="Copy A" emptyText="No values only in A" items={onlyInA} marker="-" title="Only in A" type="removed" />
      <TextDiffOnlyColumn copyLabel="Copy B" emptyText="No values only in B" items={onlyInB} marker="+" title="Only in B" type="added" />
    </div>
  );
}

export { TextDiffOnlyView };
