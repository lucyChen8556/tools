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

  if (mode !== 'auto') {
    return {
      digits: `${sign}${unsigned.replace(/^0[xob]/i, '')}`,
      base: Number(mode),
      label: baseOptions.find((option) => option.value === mode)?.label ?? mode,
    };
  }
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

function buildNumberRows(value: bigint | null) {
  if (value === null) return [];
  return [
    { label: 'Decimal', value: value.toString(10) },
    { label: 'Binary', value: value.toString(2) },
    { label: 'Octal', value: value.toString(8) },
    { label: 'Hexadecimal', value: value.toString(16).toUpperCase() },
    { label: 'Hex with prefix', value: `${value < 0n ? '-' : ''}0x${(value < 0n ? -value : value).toString(16).toUpperCase()}` },
  ];
}

export { baseOptions, buildNumberRows, parseBigInt };
export type { BaseMode };
