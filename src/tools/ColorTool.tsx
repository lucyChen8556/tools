import { useState } from 'react';
import { Field } from '../components/Field';
import { parseHexColor } from '../utils/color';

function ColorTool() {
  const [value, setValue] = useState('#2F6F73');
  const color = parseHexColor(value);

  return (
    <section className="tool-surface">
      <div className="inline-controls wide">
        <Field label="HEX" compact>
          <input value={value} onChange={(event) => setValue(event.target.value)} />
        </Field>
        <input className="color-picker" type="color" value={color?.hex ?? '#000000'} onChange={(event) => setValue(event.target.value)} title="Pick color" />
      </div>
      <div className="color-panel">
        <div className="swatch" style={{ background: color?.hex ?? '#f2f4f6' }} />
        <div className="output-grid">
          <Field label="HEX">
            <input readOnly value={color?.hex ?? 'Invalid color'} />
          </Field>
          <Field label="RGB">
            <input readOnly value={color?.rgb ?? 'Invalid color'} />
          </Field>
          <Field label="HSL">
            <input readOnly value={color?.hsl ?? 'Invalid color'} />
          </Field>
        </div>
      </div>
    </section>
  );
}
export { ColorTool };
