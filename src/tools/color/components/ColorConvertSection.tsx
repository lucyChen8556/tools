import { TextInputField } from '@/components/TextInputField';
import { ToolSection } from '@/components/ToolSection';
import { colorDefaults, parseHexColor } from '../colorUtils';

type ColorConvertSectionProps = {
  value: string;
  onValueChange: (value: string) => void;
};

function ColorConvertSection({ value, onValueChange }: ColorConvertSectionProps) {
  const color = parseHexColor(value);

  return (
    <ToolSection title="Color converter">
      <div className="inline-controls wide">
        <TextInputField label="HEX" value={value} onChange={onValueChange} compact />
        <input
          className="color-picker"
          type="color"
          value={color?.hex ?? colorDefaults.colorPickerFallback}
          onChange={(event) => onValueChange(event.target.value)}
          title="Pick color"
        />
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
  );
}

export { ColorConvertSection };
