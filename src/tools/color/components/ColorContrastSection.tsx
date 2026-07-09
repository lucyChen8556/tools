import { useMemo } from 'react';
import { Repeat2 } from 'lucide-react';
import { TextInputField } from '@/components/TextInputField';
import { MetricsGrid } from '@/components/ToolLayout';
import type { ToolMetric } from '@/components/ToolLayout';
import { ToolSection } from '@/components/ToolSection';
import { ToolbarButton } from '@/components/ToolbarButton';
import {
  colorDefaults,
  formatContrastRatio,
  getContrastPassLabel,
  getContrastRatio,
  parseHexColor,
} from '../colorUtils';

type ColorContrastSectionProps = {
  foreground: string;
  background: string;
  onForegroundChange: (value: string) => void;
  onBackgroundChange: (value: string) => void;
};

function ColorContrastSection({ foreground, background, onForegroundChange, onBackgroundChange }: ColorContrastSectionProps) {
  const foregroundColor = parseHexColor(foreground);
  const backgroundColor = parseHexColor(background);
  const contrastRatio = getContrastRatio(foregroundColor, backgroundColor);
  const contrastMetricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Ratio', value: formatContrastRatio(contrastRatio) },
      { label: 'Normal AA', value: getContrastPassLabel(contrastRatio, 4.5) },
      { label: 'Normal AAA', value: getContrastPassLabel(contrastRatio, 7) },
      { label: 'Large AA', value: getContrastPassLabel(contrastRatio, 3) },
      { label: 'Large AAA', value: getContrastPassLabel(contrastRatio, 4.5) },
      { label: 'UI components', value: getContrastPassLabel(contrastRatio, 3) },
    ],
    [contrastRatio],
  );

  function swapColors() {
    onForegroundChange(background);
    onBackgroundChange(foreground);
  }

  return (
    <ToolSection title="Contrast checker">
      <div className="inline-controls wide contrast-controls">
        <TextInputField label="Foreground" value={foreground} onChange={onForegroundChange} compact />
        <input
          className="color-picker"
          type="color"
          value={foregroundColor?.hex ?? colorDefaults.colorPickerFallback}
          onChange={(event) => onForegroundChange(event.target.value)}
          title="Pick foreground color"
        />
        <TextInputField label="Background" value={background} onChange={onBackgroundChange} compact />
        <input
          className="color-picker"
          type="color"
          value={backgroundColor?.hex ?? colorDefaults.background}
          onChange={(event) => onBackgroundChange(event.target.value)}
          title="Pick background color"
        />
        <ToolbarButton title="Swap foreground and background" icon={<Repeat2 size={16} />} label="Swap" onClick={swapColors} />
      </div>

      <div className="contrast-panel">
        <div
          className="contrast-preview"
          style={{
            background: backgroundColor?.hex ?? colorDefaults.background,
            color: foregroundColor?.hex ?? colorDefaults.foreground,
          }}
        >
          <strong>Readable interface text</strong>
          <span>Buttons, labels, alerts, release notes, and documentation copy.</span>
        </div>
        <MetricsGrid items={contrastMetricsItems} />
      </div>
    </ToolSection>
  );
}

export { ColorContrastSection };
