import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { CopyableRows } from '../components/CopyableRows';
import { SelectField } from '../components/SelectField';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolbarButton } from '../components/ToolbarButton';
import { baseOptions, buildNumberRows, numberDefaults, parseBigInt, type BaseMode } from './number/numberUtils';

function NumberTool() {
  const [input, setInput] = useState(numberDefaults.input);
  const [baseMode, setBaseMode] = useState<BaseMode>(numberDefaults.baseMode);
  const parsed = useMemo(() => parseBigInt(input, baseMode), [baseMode, input]);
  const value = parsed.value;
  const rows = buildNumberRows(value);
  const metricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Detected base', value: parsed.detected.label },
      { label: 'Sign', value: value === null ? '-' : value < 0n ? 'Negative' : 'Positive' },
      { label: 'Digits', value: parsed.detected.digits.replace('-', '').length || '-' },
      { label: 'Bit length', value: value === null ? '-' : (value < 0n ? -value : value).toString(2).length },
    ],
    [parsed.detected.digits, parsed.detected.label, value],
  );

  return (
    <section className="tool-surface">
      <div className="inline-controls">
        <TextInputField label="Number" value={input} onChange={setInput} compact />
        <SelectField label="Input base" value={baseMode} options={baseOptions} onChange={setBaseMode} />
      </div>
      {parsed.error ? <div className="notice error">{parsed.error}</div> : null}
      <MetricsGrid items={metricsItems} />
      <CopyableRows rows={rows} />
      <ActionBar>
        <ToolbarButton title="Reset sample" variant="primary" onClick={() => setInput(numberDefaults.input)}>
          <RotateCcw size={16} />
          <span>Sample</span>
        </ToolbarButton>
      </ActionBar>
    </section>
  );
}

export { NumberTool };
