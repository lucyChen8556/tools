import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { CopyableRows } from '../components/CopyableRows';
import { SelectField } from '../components/SelectField';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import { ToolbarButton } from '../components/ToolbarButton';

const baseOptions = [
  { label: 'Auto detect', value: 'auto' },
  { label: 'Decimal', value: '10' },
  { label: 'Binary', value: '2' },
  { label: 'Octal', value: '8' },
  { label: 'Hexadecimal', value: '16' },
] as const;

type BaseMode = (typeof baseOptions)[number]['value'];

function detectBase(value: string, mode: BaseMode) {
  const normalized = value.trim().replace(/_/g, '').replace(/\s+/g, '');
  if (!normalized) return { digits: '', base: 10, label: 'Decimal' };
  const sign = normalized.startsWith('-') ? '-' : '';
  const unsigned = sign ? normalized.slice(1) : normalized;

  if (mode !== 'auto') return { digits: `${sign}${unsigned.replace(/^0[xob]/i, '')}`, base: Number(mode), label: baseOptions.find((option) => option.value === mode)?.label ?? mode };
  if (/^0b/i.test(unsigned)) return { digits: `${sign}${unsigned.slice(2)}`, base: 2, label: 'Binary' };
  if (/^0o/i.test(unsigned)) return { digits: `${sign}${unsigned.slice(2)}`, base: 8, label: 'Octal' };
  if (/^0x/i.test(unsigned)) return { digits: `${sign}${unsigned.slice(2)}`, base: 16, label: 'Hexadecimal' };
  if (/^[0-9a-f]+$/i.test(unsigned) && /[a-f]/i.test(unsigned)) return { digits: `${sign}${unsigned}`, base: 16, label: 'Hexadecimal' };
  return { digits: `${sign}${unsigned}`, base: 10, label: 'Decimal' };
}

function parseBigInt(value: string, mode: BaseMode) {
  const detected = detectBase(value, mode);
  const negative = detected.digits.startsWith('-');
  const digits = negative ? detected.digits.slice(1) : detected.digits;
  const validPattern = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^\d+$/,
    16: /^[0-9a-f]+$/i,
  }[detected.base as 2 | 8 | 10 | 16];

  if (!digits) return { value: null, error: 'Enter a number', detected };
  if (!validPattern.test(digits)) return { value: null, error: `Invalid ${detected.label.toLowerCase()} number`, detected };

  const parsed =
    detected.base === 10
      ? BigInt(digits)
      : BigInt(`${detected.base === 2 ? '0b' : detected.base === 8 ? '0o' : '0x'}${digits}`);

  return { value: negative ? -parsed : parsed, error: '', detected };
}

function NumberTool() {
  const [input, setInput] = useState('0xff');
  const [baseMode, setBaseMode] = useState<BaseMode>('auto');
  const parsed = useMemo(() => parseBigInt(input, baseMode), [baseMode, input]);
  const value = parsed.value;
  const rows = value === null
    ? []
    : [
        { label: 'Decimal', value: value.toString(10) },
        { label: 'Binary', value: value.toString(2) },
        { label: 'Octal', value: value.toString(8) },
        { label: 'Hexadecimal', value: value.toString(16).toUpperCase() },
        { label: 'Hex with prefix', value: `${value < 0n ? '-' : ''}0x${(value < 0n ? -value : value).toString(16).toUpperCase()}` },
      ];

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
