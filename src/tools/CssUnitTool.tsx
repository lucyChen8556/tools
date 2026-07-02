import { useMemo, useState } from 'react';
import { Ruler } from 'lucide-react';
import { CopyableRows } from '../components/CopyableRows';
import { SelectField } from '../components/SelectField';
import { TextInputField } from '../components/TextInputField';
import { MetricsGrid } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';

const cssUnitOptions = [
  { label: 'px', value: 'px' },
  { label: 'rem', value: 'rem' },
  { label: 'em', value: 'em' },
  { label: '%', value: '%' },
  { label: 'vw', value: 'vw' },
  { label: 'vh', value: 'vh' },
] as const;

type CssUnit = (typeof cssUnitOptions)[number]['value'];

function readNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return '-';
  return Number.parseFloat(value.toFixed(4)).toString();
}

function formatCssValue(value: number, unit: CssUnit) {
  if (!Number.isFinite(value)) return '-';
  return `${formatNumber(value)}${unit}`;
}

function toPixels(value: number, unit: CssUnit, context: { basePx: number; parentPx: number; viewportWidth: number; viewportHeight: number }) {
  if (unit === 'px') return value;
  if (unit === 'rem' || unit === 'em') return value * context.basePx;
  if (unit === '%') return (value / 100) * context.parentPx;
  if (unit === 'vw') return (value / 100) * context.viewportWidth;
  return (value / 100) * context.viewportHeight;
}

function CssUnitTool() {
  const [value, setValue] = useState('24');
  const [unit, setUnit] = useState<CssUnit>('px');
  const [basePx, setBasePx] = useState('16');
  const [parentPx, setParentPx] = useState('320');
  const [viewportWidth, setViewportWidth] = useState('1440');
  const [viewportHeight, setViewportHeight] = useState('900');

  const result = useMemo(() => {
    const numericValue = readNumber(value, Number.NaN);
    const context = {
      basePx: readNumber(basePx, 16),
      parentPx: readNumber(parentPx, 320),
      viewportWidth: readNumber(viewportWidth, 1440),
      viewportHeight: readNumber(viewportHeight, 900),
    };
    const px = toPixels(numericValue, unit, context);

    return {
      px,
      rows: [
        { label: 'px', value: formatCssValue(px, 'px') },
        { label: 'rem', value: formatCssValue(px / context.basePx, 'rem') },
        { label: 'em', value: formatCssValue(px / context.basePx, 'em') },
        { label: '%', value: formatCssValue((px / context.parentPx) * 100, '%') },
        { label: 'vw', value: formatCssValue((px / context.viewportWidth) * 100, 'vw') },
        { label: 'vh', value: formatCssValue((px / context.viewportHeight) * 100, 'vh') },
      ],
    };
  }, [basePx, parentPx, unit, value, viewportHeight, viewportWidth]);

  return (
    <section className="tool-surface">
      <ToolSection title="Input">
        <div className="inline-controls wide unit-controls">
          <TextInputField label="Value" value={value} onChange={setValue} compact />
          <SelectField label="From unit" value={unit} options={cssUnitOptions} onChange={(nextUnit) => setUnit(nextUnit as CssUnit)} />
          <TextInputField label="Base px" value={basePx} onChange={setBasePx} compact />
          <TextInputField label="Parent px" value={parentPx} onChange={setParentPx} compact />
          <TextInputField label="Viewport width" value={viewportWidth} onChange={setViewportWidth} compact />
          <TextInputField label="Viewport height" value={viewportHeight} onChange={setViewportHeight} compact />
        </div>
      </ToolSection>

      <ToolSection title="Output">
        <CopyableRows rows={result.rows} />
      </ToolSection>

      <MetricsGrid
        items={[
          { label: 'Input', value: `${value}${unit}` },
          { label: 'Normalized px', value: formatNumber(result.px) },
          { label: 'Base', value: `${basePx}px` },
          { label: 'Viewport', value: `${viewportWidth} x ${viewportHeight}` },
        ]}
      />
      <div className="notice warning">
        <Ruler size={16} />
        <span>em uses the same base px field here. Use parent px for percentage conversion.</span>
      </div>
    </section>
  );
}

export { CssUnitTool };
