import { useState } from 'react';
import { TextInputField } from '../components/TextInputField';
import { parseHexColor } from '../utils/color';

function ColorTool() {
  const [value, setValue] = useState('#2F6F73');
  const color = parseHexColor(value);

  return (
    <section className="tool-surface">
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
    </section>
  );
}
export { ColorTool };
