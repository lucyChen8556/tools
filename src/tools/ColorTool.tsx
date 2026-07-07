import { useMemo, useState } from 'react';
import { Repeat2 } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { TextAreaField } from '../components/TextAreaField';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import {
  formatContrastRatio,
  formatPaletteOutput,
  getContrastPassLabel,
  getContrastRatio,
  parseColorPalette,
  parseHexColor,
} from './color/colorUtils';

const colorToolTabs = [
  { label: 'Convert', value: 'convert' },
  { label: 'Palette', value: 'palette' },
  { label: 'Contrast', value: 'contrast' },
] as const;

type ColorToolTab = (typeof colorToolTabs)[number]['value'];

function ColorTool() {
  const [activeTab, setActiveTab] = useState<ColorToolTab>('convert');
  const [value, setValue] = useState('#2F6F73');
  const [foreground, setForeground] = useState('#111827');
  const [background, setBackground] = useState('#FFFFFF');
  const [paletteInput, setPaletteInput] = useState('#2F6F73 #111827 #FFFFFF\n#0D9488, #F97316, #EAB308');
  const color = parseHexColor(value);
  const foregroundColor = parseHexColor(foreground);
  const backgroundColor = parseHexColor(background);
  const contrastRatio = getContrastRatio(foregroundColor, backgroundColor);
  const palette = useMemo(() => parseColorPalette(paletteInput), [paletteInput]);
  const paletteOutput = useMemo(() => formatPaletteOutput(palette.colors), [palette.colors]);
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

  return (
    <section className="tool-surface">
      <SegmentedTabs ariaLabel="Color tool mode" options={colorToolTabs} value={activeTab} onChange={setActiveTab} />

      {activeTab === 'convert' ? (
        <ToolSection title="Color converter">
          <div className="inline-controls wide">
            <TextInputField label="HEX" value={value} onChange={setValue} compact />
            <input className="color-picker" type="color" value={color?.hex ?? '#000000'} onChange={(event) => setValue(event.target.value)} title="Pick color" />
          </div>
          <div className="color-panel">
            <div className="swatch" style={{ background: color?.hex ?? '#f2f4f6' }} />
            <div className="output-grid">
              <TextInputField label="HEX" value={color?.hex ?? 'Invalid color'} readOnly />
              <TextInputField label="RGB" value={color?.rgb ?? 'Invalid color'} readOnly />
              <TextInputField label="HSL" value={color?.hsl ?? 'Invalid color'} readOnly />
            </div>
          </div>
        </ToolSection>
      ) : null}

      {activeTab === 'palette' ? (
        <ToolSection title="Palette builder">
          <TextAreaField label="Colors" value={paletteInput} onChange={setPaletteInput} spellCheck={false} />
          <div className="palette-grid" aria-label="Generated color swatches">
            {palette.colors.length === 0 ? (
              <div className="empty-state compact">No valid colors found</div>
            ) : (
              palette.colors.map((paletteColor) => (
                <button
                  className="palette-swatch"
                  key={`${paletteColor.source}-${paletteColor.hex}`}
                  type="button"
                  onClick={() => {
                    setValue(paletteColor.hex);
                    setActiveTab('convert');
                  }}
                  title={`Use ${paletteColor.hex} in converter`}
                >
                  <span style={{ background: paletteColor.hex }} />
                  <strong>{paletteColor.hex}</strong>
                  <small>{paletteColor.rgb}</small>
                </button>
              ))
            )}
          </div>
          <ActionBar>
            <CopyButton title="Copy palette values" value={paletteOutput} label="Copy palette" />
            <CopyButton title="Copy HEX colors" value={palette.colors.map((paletteColor) => paletteColor.hex).join('\n')} label="Copy HEX" />
          </ActionBar>
          <MetricsGrid
            items={[
              { label: 'Valid colors', value: palette.colors.length || '-' },
              { label: 'Invalid tokens', value: palette.invalidItems.length || '-' },
              { label: 'Total tokens', value: palette.totalItems || '-' },
              { label: 'First color', value: palette.colors[0]?.hex ?? '-' },
            ]}
          />
          {palette.invalidItems.length > 0 ? (
            <div className="notice warning">
              <span>{`Ignored: ${palette.invalidItems.slice(0, 6).join(', ')}${palette.invalidItems.length > 6 ? '...' : ''}`}</span>
            </div>
          ) : null}
        </ToolSection>
      ) : null}

      {activeTab === 'contrast' ? (
        <ToolSection title="Contrast checker">
          <div className="inline-controls wide contrast-controls">
            <TextInputField label="Foreground" value={foreground} onChange={setForeground} compact />
            <input
              className="color-picker"
              type="color"
              value={foregroundColor?.hex ?? '#000000'}
              onChange={(event) => setForeground(event.target.value)}
              title="Pick foreground color"
            />
            <TextInputField label="Background" value={background} onChange={setBackground} compact />
            <input
              className="color-picker"
              type="color"
              value={backgroundColor?.hex ?? '#FFFFFF'}
              onChange={(event) => setBackground(event.target.value)}
              title="Pick background color"
            />
            <ToolbarButton
              title="Swap foreground and background"
              onClick={() => {
                setForeground(background);
                setBackground(foreground);
              }}
            >
              <Repeat2 size={16} />
              <span>Swap</span>
            </ToolbarButton>
          </div>

          <div className="contrast-panel">
            <div
              className="contrast-preview"
              style={{
                background: backgroundColor?.hex ?? '#ffffff',
                color: foregroundColor?.hex ?? '#111827',
              }}
            >
              <strong>Readable interface text</strong>
              <span>Buttons, labels, alerts, release notes, and documentation copy.</span>
            </div>
            <MetricsGrid items={contrastMetricsItems} />
          </div>
        </ToolSection>
      ) : null}
    </section>
  );
}
export { ColorTool };
