import { useMemo, useState } from 'react';
import { Repeat2 } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { EmptyState } from '../components/EmptyState';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { TextAreaField } from '../components/TextAreaField';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import {
  colorDefaults,
  colorToolTabs,
  formatContrastRatio,
  formatGeneratedPaletteOutput,
  formatPaletteOutput,
  generateColorPalettes,
  getContrastPassLabel,
  getContrastRatio,
  normalizeGeneratedCount,
  parseColorPalette,
  parseHexColor,
  type ColorToolTab,
} from './color/colorUtils';

function ColorTool() {
  const [activeTab, setActiveTab] = useState<ColorToolTab>(colorDefaults.activeTab);
  const [value, setValue] = useState(colorDefaults.value);
  const [foreground, setForeground] = useState(colorDefaults.foreground);
  const [background, setBackground] = useState(colorDefaults.background);
  const [paletteInput, setPaletteInput] = useState(colorDefaults.paletteInput);
  const [generatorColor, setGeneratorColor] = useState(colorDefaults.generatorColor);
  const [generatorCount, setGeneratorCount] = useState(colorDefaults.generatorCount);
  const color = parseHexColor(value);
  const foregroundColor = parseHexColor(foreground);
  const backgroundColor = parseHexColor(background);
  const contrastRatio = getContrastRatio(foregroundColor, backgroundColor);
  const palette = useMemo(() => parseColorPalette(paletteInput), [paletteInput]);
  const paletteOutput = useMemo(() => formatPaletteOutput(palette.colors), [palette.colors]);
  const generatedCount = normalizeGeneratedCount(generatorCount);
  const generatedPalette = useMemo(() => generateColorPalettes(generatorColor, generatedCount), [generatorColor, generatedCount]);
  const generatedOutput = useMemo(() => formatGeneratedPaletteOutput(generatedPalette.groups), [generatedPalette.groups]);
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
            <input className="color-picker" type="color" value={color?.hex ?? colorDefaults.colorPickerFallback} onChange={(event) => setValue(event.target.value)} title="Pick color" />
          </div>
          <div className="color-panel">
            <div className="swatch" style={{ background: color?.hex ?? colorDefaults.panelFallback }} />
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
              <EmptyState compact>No valid colors found</EmptyState>
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

      {activeTab === 'generate' ? (
        <ToolSection title="Color generator">
          <div className="inline-controls wide">
            <TextInputField label="Base color" value={generatorColor} onChange={setGeneratorColor} compact />
            <input
              className="color-picker"
              type="color"
              value={generatedPalette.baseColor?.hex ?? colorDefaults.colorPickerFallback}
              onChange={(event) => setGeneratorColor(event.target.value)}
              title="Pick base color"
            />
            <TextInputField
              label="Swatches per type"
              type="number"
              min={1}
              max={colorDefaults.maxGeneratedCount}
              value={generatorCount}
              onChange={setGeneratorCount}
              compact
            />
          </div>

          {!generatedPalette.baseColor ? (
            <div className="notice error">Enter a valid HEX color to generate palettes.</div>
          ) : (
            <>
              {generatedPalette.groups.map((group) => (
                <div className="generated-palette-group" key={group.id}>
                  <div className="palette-group-heading">
                    <strong>{group.label}</strong>
                    <span>{`${group.colors.length} swatches`}</span>
                  </div>
                  <div className="palette-grid" aria-label={`${group.label} swatches`}>
                    {group.colors.map((generatedColor) => (
                      <button
                        className="palette-swatch"
                        key={`${group.id}-${generatedColor.label}-${generatedColor.css}`}
                        type="button"
                        onClick={() => {
                          setValue(generatedColor.baseHex);
                          setActiveTab('convert');
                        }}
                        title={`Use ${generatedColor.baseHex} in converter`}
                      >
                        <span style={{ background: generatedColor.preview }} />
                        <strong>{generatedColor.css}</strong>
                        <small>{generatedColor.label}</small>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <ActionBar>
                <CopyButton title="Copy generated palettes" value={generatedOutput} label="Copy palettes" />
                <CopyButton
                  title="Copy generated CSS values"
                  value={generatedPalette.groups.flatMap((group) => group.colors.map((generatedColor) => generatedColor.css)).join('\n')}
                  label="Copy values"
                />
              </ActionBar>
              <MetricsGrid
                items={[
                  { label: 'Base color', value: generatedPalette.baseColor.hex },
                  { label: 'Types', value: generatedPalette.groups.length },
                  { label: 'Per type', value: generatedPalette.count },
                  { label: 'Total swatches', value: generatedPalette.groups.reduce((sum, group) => sum + group.colors.length, 0) },
                ]}
              />
            </>
          )}
        </ToolSection>
      ) : null}

      {activeTab === 'contrast' ? (
        <ToolSection title="Contrast checker">
          <div className="inline-controls wide contrast-controls">
            <TextInputField label="Foreground" value={foreground} onChange={setForeground} compact />
            <input
              className="color-picker"
              type="color"
              value={foregroundColor?.hex ?? colorDefaults.colorPickerFallback}
              onChange={(event) => setForeground(event.target.value)}
              title="Pick foreground color"
            />
            <TextInputField label="Background" value={background} onChange={setBackground} compact />
            <input
              className="color-picker"
              type="color"
              value={backgroundColor?.hex ?? colorDefaults.background}
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
      ) : null}
    </section>
  );
}
export { ColorTool };
