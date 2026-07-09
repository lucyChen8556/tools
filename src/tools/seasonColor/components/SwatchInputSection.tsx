import { RotateCcw, Sparkles } from 'lucide-react';
import { ActionBar } from '@/components/ToolLayout';
import { ToolSection } from '@/components/ToolSection';
import { ToolbarButton } from '@/components/ToolbarButton';
import { TextAreaField } from '@/components/TextAreaField';
import type { SeasonKey } from '../seasonColorTypes';
import { QuickPaletteGrid } from './QuickPaletteGrid';

type SwatchInputSectionProps = {
  bulkInput: string;
  onAnalyze: () => void;
  onBulkInputChange: (value: string) => void;
  onLoadSample: () => void;
  onQuickPaletteSelect: (season: SeasonKey) => void;
  status: string;
};

function SwatchInputSection({
  bulkInput,
  onAnalyze,
  onBulkInputChange,
  onLoadSample,
  onQuickPaletteSelect,
  status,
}: SwatchInputSectionProps) {
  return (
    <ToolSection title="Swatch input">
      <TextAreaField label="Paste swatches" value={bulkInput} onChange={onBulkInputChange} spellCheck={false} />
      <ActionBar>
        <ToolbarButton title="Parse swatches and analyze" variant="primary" icon={<Sparkles size={16} />} label="Analyze" onClick={onAnalyze} />
        <ToolbarButton title="Load sample swatches" icon={<RotateCcw size={16} />} label="Sample" onClick={onLoadSample} />
      </ActionBar>
      <p className="season-hint">{status}</p>
      <QuickPaletteGrid onSelect={onQuickPaletteSelect} />
    </ToolSection>
  );
}

export { SwatchInputSection };
