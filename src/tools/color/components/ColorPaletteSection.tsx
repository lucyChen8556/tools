import { useMemo } from 'react';
import { CopyButton } from '@/components/CopyButton';
import { EmptyState } from '@/components/EmptyState';
import { TextAreaField } from '@/components/TextAreaField';
import { ActionBar, MetricsGrid } from '@/components/ToolLayout';
import { ToolSection } from '@/components/ToolSection';
import { formatPaletteOutput, parseColorPalette } from '../colorUtils';

type ColorPaletteSectionProps = {
  paletteInput: string;
  onPaletteInputChange: (value: string) => void;
  onUseColor: (hex: string) => void;
};

function ColorPaletteSection({ paletteInput, onPaletteInputChange, onUseColor }: ColorPaletteSectionProps) {
  const palette = useMemo(() => parseColorPalette(paletteInput), [paletteInput]);
  const paletteOutput = useMemo(() => formatPaletteOutput(palette.colors), [palette.colors]);
  const hexOutput = useMemo(() => palette.colors.map((paletteColor) => paletteColor.hex).join('\n'), [palette.colors]);

  return (
    <ToolSection title="Palette builder">
      <TextAreaField label="Colors" value={paletteInput} onChange={onPaletteInputChange} spellCheck={false} />
      <div className="palette-grid" aria-label="Generated color swatches">
        {palette.colors.length === 0 ? (
          <EmptyState compact>No valid colors found</EmptyState>
        ) : (
          palette.colors.map((paletteColor) => (
            <button
              className="palette-swatch"
              key={`${paletteColor.source}-${paletteColor.hex}`}
              type="button"
              onClick={() => onUseColor(paletteColor.hex)}
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
        <CopyButton title="Copy HEX colors" value={hexOutput} label="Copy HEX" />
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
  );
}

export { ColorPaletteSection };
