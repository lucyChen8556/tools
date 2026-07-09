import { CopyButton } from '@/components/CopyButton';
import { EmptyState } from '@/components/EmptyState';

type TextDiffOnlyViewProps = {
  onlyInA: string[];
  onlyInB: string[];
};

function TextDiffOnlyColumn({
  emptyText,
  items,
  marker,
  title,
  type,
}: {
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
          <CopyButton title={`Copy ${title} values`} value={copyValue} />
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
      <TextDiffOnlyColumn emptyText="No before-only values" items={onlyInA} marker="-" title="Before only" type="removed" />
      <TextDiffOnlyColumn emptyText="No after-only values" items={onlyInB} marker="+" title="After only" type="added" />
    </div>
  );
}

export { TextDiffOnlyView };
