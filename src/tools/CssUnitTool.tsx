import { useMemo, useState } from 'react';
import { Ruler } from 'lucide-react';
import { CopyableRows } from '../components/CopyableRows';
import { SelectField } from '../components/SelectField';
import { TextInputField } from '../components/TextInputField';
import { TextInputControls } from '../components/TextInputControls';
import { MetricsGrid } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import {
  buildClamp,
  buildCssUnitRows,
  cssUnitDefaults,
  cssUnitOptions,
  formatCssNumber,
  formatPxValue,
  readCssNumber,
  type CssUnit,
} from './cssUnit/cssUnitUtils';

function CssUnitTool() {
  const [value, setValue] = useState(cssUnitDefaults.value);
  const [unit, setUnit] = useState<CssUnit>(cssUnitDefaults.unit);
  const [basePx, setBasePx] = useState(cssUnitDefaults.basePx);
  const [parentPx, setParentPx] = useState(cssUnitDefaults.parentPx);
  const [viewportWidth, setViewportWidth] = useState(cssUnitDefaults.viewportWidth);
  const [viewportHeight, setViewportHeight] = useState(cssUnitDefaults.viewportHeight);
  const [clampMinSize, setClampMinSize] = useState(cssUnitDefaults.clampMinSize);
  const [clampMaxSize, setClampMaxSize] = useState(cssUnitDefaults.clampMaxSize);
  const [clampMinViewport, setClampMinViewport] = useState(cssUnitDefaults.clampMinViewport);
  const [clampMaxViewport, setClampMaxViewport] = useState(cssUnitDefaults.clampMaxViewport);

  const result = useMemo(() => {
    const numericValue = readCssNumber(value, Number.NaN);
    const context = {
      basePx: readCssNumber(basePx, Number(cssUnitDefaults.basePx)),
      parentPx: readCssNumber(parentPx, Number(cssUnitDefaults.parentPx)),
      viewportWidth: readCssNumber(viewportWidth, Number(cssUnitDefaults.viewportWidth)),
      viewportHeight: readCssNumber(viewportHeight, Number(cssUnitDefaults.viewportHeight)),
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
        readCssNumber(basePx, Number(cssUnitDefaults.basePx)),
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
        <TextInputControls
          className="clamp-controls"
          controls={[
            { label: 'Min size px', value: clampMinSize, onChange: setClampMinSize },
            { label: 'Max size px', value: clampMaxSize, onChange: setClampMaxSize },
            { label: 'Min viewport px', value: clampMinViewport, onChange: setClampMinViewport },
            { label: 'Max viewport px', value: clampMaxViewport, onChange: setClampMaxViewport },
            { label: 'Base px', value: basePx, onChange: setBasePx },
          ]}
        />
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
