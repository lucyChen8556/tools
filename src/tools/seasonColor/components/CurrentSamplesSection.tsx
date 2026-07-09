import { Trash2 } from 'lucide-react';
import { ActionBar } from '@/components/ToolLayout';
import { ToolSection } from '@/components/ToolSection';
import { ToolbarButton } from '@/components/ToolbarButton';
import type { SeasonSwatch } from '../seasonColorTypes';
import { SampleList } from './SampleList';

type CurrentSamplesSectionProps = {
  onClear: () => void;
  onRemove: (index: number) => void;
  swatches: SeasonSwatch[];
};

function CurrentSamplesSection({ onClear, onRemove, swatches }: CurrentSamplesSectionProps) {
  return (
    <ToolSection title="Current samples">
      <SampleList swatches={swatches} onRemove={onRemove} />
      <ActionBar>
        <ToolbarButton title="Clear all colors" icon={<Trash2 size={16} />} label="Clear all" onClick={onClear} disabled={swatches.length === 0} />
      </ActionBar>
    </ToolSection>
  );
}

export { CurrentSamplesSection };
