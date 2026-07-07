import { useMemo, useState } from 'react';
import { Ruler } from 'lucide-react';
import { CopyableRows } from '../components/CopyableRows';
import { SelectField } from '../components/SelectField';
import { TextInputField } from '../components/TextInputField';
import { MetricsGrid } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { buildClamp, buildCssUnitRows, cssUnitOptions, formatCssNumber, formatPxValue, readCssNumber, type CssUnit } from './cssUnit/cssUnitUtils';

function CssUnitTool() {
  const [value, setValue] = useState('24');
  const [unit, setUnit] = useState<CssUnit>('px');
  const [basePx, setBasePx] = useState('16');
  const [parentPx, setParentPx] = useState('320');
  const [viewportWidth, setViewportWidth] = useState('1440');
  const [viewportHeight, setViewportHeight] = useState('900');
  const [clampMinSize, setClampMinSize] = useState('16');
  const [clampMaxSize, setClampMaxSize] = useState('32');
  const [clampMinViewport, setClampMinViewport] = useState('375');
  const [clampMaxViewport, setClampMaxViewport] = useState('1440');

  const result = useMemo(() => {
    const numericValue = readCssNumber(value, Number.NaN);
    const context = {
      basePx: readCssNumber(basePx, 16),
      parentPx: readCssNumber(parentPx, 320),
      viewportWidth: readCssNumber(viewportWidth, 1440),
      viewportHeight: readCssNumber(viewportHeight, 900),
    };
    return buildCssUnitRows(numericValue, unit, context);
  }, [basePx, parentPx, unit, value, viewportHeight, viewportWidth]);
  const clampResult = useMemo(
    () =>
      buildClamp(
        readCssNumber(clampMinSize, Number.NaN),
        readCssNumber(clampMaxSize, Number.NaN),
        readCssNumber(clampMinViewport, Number.NaN),
        readCssNumber(clampMaxViewport, Number.NaN),
        readCssNumber(basePx, 16),
      ),
    [basePx, clampMaxSize, clampMaxViewport, clampMinSize, clampMinViewport],
  );
  const clampMetricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Slope', value: Number.isFinite(clampResult.slope) ? `${formatCssNumber(clampResult.slope)}vw` : '-' },
      { label: 'Intercept', value: formatPxValue(clampResult.intercept) },
      { label: 'Viewport range', value: `${clampMinViewport}px - ${clampMaxViewport}px` },
      { label: 'Size range', value: `${clampMinSize}px - ${clampMaxSize}px` },
    ],
    [clampMaxSize, clampMaxViewport, clampMinSize, clampMinViewport, clampResult.intercept, clampResult.slope],
  );
  const metricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Input', value: `${value}${unit}` },
      { label: 'Normalized px', value: formatCssNumber(result.px) },
      { label: 'Base', value: `${basePx}px` },
      { label: 'Viewport', value: `${viewportWidth} x ${viewportHeight}` },
    ],
    [basePx, result.px, unit, value, viewportHeight, viewportWidth],
  );

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

      <ToolSection title="Clamp calculator">
        <div className="inline-controls wide clamp-controls">
          <TextInputField label="Min size px" value={clampMinSize} onChange={setClampMinSize} compact />
          <TextInputField label="Max size px" value={clampMaxSize} onChange={setClampMaxSize} compact />
          <TextInputField label="Min viewport px" value={clampMinViewport} onChange={setClampMinViewport} compact />
          <TextInputField label="Max viewport px" value={clampMaxViewport} onChange={setClampMaxViewport} compact />
          <TextInputField label="Base px" value={basePx} onChange={setBasePx} compact />
        </div>
        <CopyableRows
          rows={[
            { label: 'clamp px', value: clampResult.px },
            { label: 'clamp rem', value: clampResult.rem },
            { label: 'preferred', value: clampResult.preferred },
          ]}
        />
        <MetricsGrid items={clampMetricsItems} />
      </ToolSection>

      <MetricsGrid items={metricsItems} />
      <div className="notice warning">
        <Ruler size={16} />
        <span>em uses the same base px field here. Use parent px for percentage conversion.</span>
      </div>
    </section>
  );
}

export { CssUnitTool };
