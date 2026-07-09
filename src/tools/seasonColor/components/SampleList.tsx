import { Trash2 } from 'lucide-react';
import { EmptyState } from '../../../components/EmptyState';
import { groupMeta } from '../seasonColorData';
import type { SeasonSwatch } from '../seasonColorTypes';

type SampleListProps = {
  swatches: SeasonSwatch[];
  onRemove: (index: number) => void;
};

function SampleList({ swatches, onRemove }: SampleListProps) {
  if (swatches.length === 0) return <EmptyState compact>No colors yet</EmptyState>;

  return (
    <div className="season-sample-list">
      {swatches.map((swatch, index) => (
        <div className="season-sample-chip" key={`${swatch.hex}-${index}`}>
          <span style={{ background: swatch.hex }} />
          <div><code>{swatch.hex}</code><small>{groupMeta[swatch.group]?.label ?? 'Uncategorized'}</small></div>
          <button type="button" title={`Remove ${swatch.hex}`} onClick={() => onRemove(index)}><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  );
}

export { SampleList };
