import { useState } from 'react';
import { Repeat2 } from 'lucide-react';
import { TextInputField } from '../components/TextInputField';
import { MetricsGrid } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import { formatContrastRatio, getContrastPassLabel, getContrastRatio, parseHexColor } from './color/colorUtils';

function ColorTool() {
  const [value, setValue] = useState('#2F6F73');
  const [foreground, setForeground] = useState('#111827');
  const [background, setBackground] = useState('#FFFFFF');
  const color = parseHexColor(value);
  const foregroundColor = parseHexColor(foreground);
  const backgroundColor = parseHexColor(background);
  const contrastRatio = getContrastRatio(foregroundColor, backgroundColor);

  return (
    <section className="tool-surface">
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
          <MetricsGrid
            items={[
              { label: 'Ratio', value: formatContrastRatio(contrastRatio) },
              { label: 'Normal AA', value: getContrastPassLabel(contrastRatio, 4.5) },
              { label: 'Normal AAA', value: getContrastPassLabel(contrastRatio, 7) },
              { label: 'Large AA', value: getContrastPassLabel(contrastRatio, 3) },
              { label: 'Large AAA', value: getContrastPassLabel(contrastRatio, 4.5) },
              { label: 'UI components', value: getContrastPassLabel(contrastRatio, 3) },
            ]}
          />
        </div>
      </ToolSection>
    </section>
  );
}
export { ColorTool };
