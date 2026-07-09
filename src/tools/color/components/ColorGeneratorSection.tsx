import { useMemo } from 'react';
import { CopyButton } from '@/components/CopyButton';
import { TextInputField } from '@/components/TextInputField';
import { ActionBar, MetricsGrid } from '@/components/ToolLayout';
import { ToolSection } from '@/components/ToolSection';
import { colorDefaults, formatGeneratedPaletteOutput, generateColorPalettes } from '../colorUtils';

type ColorGeneratorSectionProps = {
  generatorColor: string;
  generatorCount: string;
  onGeneratorColorChange: (value: string) => void;
  onGeneratorCountChange: (value: string) => void;
  onUseColor: (hex: string) => void;
};

function ColorGeneratorSection({
  generatorColor,
  generatorCount,
  onGeneratorColorChange,
  onGeneratorCountChange,
  onUseColor,
}: ColorGeneratorSectionProps) {
  const generatedPalette = useMemo(() => generateColorPalettes(generatorColor, generatorCount), [generatorColor, generatorCount]);
  const generatedOutput = useMemo(() => formatGeneratedPaletteOutput(generatedPalette.groups), [generatedPalette.groups]);
  const generatedValuesOutput = useMemo(
    () => generatedPalette.groups.flatMap((group) => group.colors.map((generatedColor) => generatedColor.css)).join('\n'),
    [generatedPalette.groups],
  );

  return (
    <ToolSection title="Color generator">
      <div className="inline-controls wide">
        <TextInputField label="Base color" value={generatorColor} onChange={onGeneratorColorChange} compact />
        <input
          className="color-picker"
          type="color"
          value={generatedPalette.baseColor?.hex ?? colorDefaults.colorPickerFallback}
          onChange={(event) => onGeneratorColorChange(event.target.value)}
          title="Pick base color"
        />
        <TextInputField
          label="Swatches per type"
          type="number"
          min={1}
          max={colorDefaults.maxGeneratedCount}
          value={generatorCount}
          onChange={onGeneratorCountChange}
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
                    onClick={() => onUseColor(generatedColor.baseHex)}
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
            <CopyButton title="Copy generated CSS values" value={generatedValuesOutput} label="Copy values" />
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
  );
}

export { ColorGeneratorSection };
