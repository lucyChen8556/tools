import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { CopyableRows } from '../components/CopyableRows';
import { SelectField } from '../components/SelectField';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import { ToolbarButton } from '../components/ToolbarButton';
import { baseOptions, buildNumberRows, parseBigInt, type BaseMode } from './number/numberUtils';

function NumberTool() {
  const [input, setInput] = useState('0xff');
  const [baseMode, setBaseMode] = useState<BaseMode>('auto');
  const parsed = useMemo(() => parseBigInt(input, baseMode), [baseMode, input]);
  const value = parsed.value;
  const rows = buildNumberRows(value);

  return (
    <section className="tool-surface">
      <div className="inline-controls">
        <TextInputField label="Number" value={input} onChange={setInput} compact />
        <SelectField label="Input base" value={baseMode} options={baseOptions} onChange={setBaseMode} />
      </div>
      {parsed.error ? <div className="notice error">{parsed.error}</div> : null}
      <MetricsGrid
        items={[
          { label: 'Detected base', value: parsed.detected.label },
          { label: 'Sign', value: value === null ? '-' : value < 0n ? 'Negative' : 'Positive' },
          { label: 'Digits', value: parsed.detected.digits.replace('-', '').length || '-' },
          { label: 'Bit length', value: value === null ? '-' : (value < 0n ? -value : value).toString(2).length },
        ]}
      />
      <CopyableRows rows={rows} />
      <ActionBar>
        <ToolbarButton title="Reset sample" variant="primary" onClick={() => setInput('0xff')}>
          <RotateCcw size={16} />
          <span>Sample</span>
        </ToolbarButton>
      </ActionBar>
    </section>
  );
}

export { NumberTool };
