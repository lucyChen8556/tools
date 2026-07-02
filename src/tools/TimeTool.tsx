import { useMemo, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { SelectField } from '../components/SelectField';
import { Stat } from '../components/Stat';
import { TextInputField } from '../components/TextInputField';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import { localeOptions, timeFormatPresetOptions, timeZoneOptions } from '../config/options';

function getTimeParts(date: Date, locale: string | undefined, timeZone: string | undefined) {
  const numericFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    hourCycle: 'h23',
    timeZone,
  });

  const numericParts = numericFormatter.formatToParts(date).reduce<Record<string, string>>((record, part) => {
    if (part.type !== 'literal') record[part.type] = part.value;
    return record;
  }, {});
  const displayFormatter = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { timeZone, ...options }).format(date);
  const hour12Parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: true,
    timeZone,
  }).formatToParts(date);
  const hour12 = hour12Parts.find((part) => part.type === 'hour')?.value ?? '';
  const dayPeriod = hour12Parts.find((part) => part.type === 'dayPeriod')?.value ?? '';

  return {
    YYYY: numericParts.year,
    YY: numericParts.year?.slice(-2) ?? '',
    M: String(Number(numericParts.month)),
    MM: numericParts.month,
    MMM: displayFormatter({ month: 'short' }),
    MMMM: displayFormatter({ month: 'long' }),
    D: String(Number(numericParts.day)),
    DD: numericParts.day,
    H: String(Number(numericParts.hour === '24' ? '0' : numericParts.hour)),
    HH: numericParts.hour === '24' ? '00' : numericParts.hour,
    h: String(Number(hour12)),
    hh: hour12,
    m: String(Number(numericParts.minute)),
    mm: numericParts.minute,
    s: String(Number(numericParts.second)),
    ss: numericParts.second,
    SSS: String(date.getMilliseconds()).padStart(3, '0'),
    A: dayPeriod.toUpperCase(),
    a: dayPeriod.toLowerCase(),
    ddd: displayFormatter({ weekday: 'short' }),
    dddd: displayFormatter({ weekday: 'long' }),
  };
}

function formatLocalizedToken(date: Date, token: string, locale: string | undefined, timeZone: string | undefined) {
  const optionsByToken: Record<string, Intl.DateTimeFormatOptions> = {
    L: { dateStyle: 'short' },
    l: { dateStyle: 'short' },
    LL: { dateStyle: 'long' },
    ll: { dateStyle: 'medium' },
    LLL: { dateStyle: 'long', timeStyle: 'short' },
    lll: { dateStyle: 'medium', timeStyle: 'short' },
    LLLL: { dateStyle: 'full', timeStyle: 'short' },
    llll: {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    },
  };

  return new Intl.DateTimeFormat(locale, { timeZone, ...optionsByToken[token] }).format(date);
}

function formatCustomDate(date: Date, pattern: string, locale: string | undefined, timeZone: string | undefined) {
  const parts = getTimeParts(date, locale, timeZone);
  return pattern.replace(
    /LLLL|llll|LLL|lll|LL|ll|YYYY|MMMM|MMM|dddd|ddd|SSS|YY|MM|DD|HH|hh|mm|ss|M|D|H|h|m|s|A|a|L|l/g,
    (token) => {
      if (/^L{1,4}$|^l{1,4}$/.test(token)) return formatLocalizedToken(date, token, locale, timeZone);
      return parts[token as keyof typeof parts];
    },
  );
}

function inspectDateInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { date: new Date(Number.NaN), type: 'Empty', unit: '-', normalized: '-' };

  if (/^-?\d+$/.test(trimmed)) {
    const negative = trimmed.startsWith('-');
    const digits = negative ? trimmed.slice(1) : trimmed;
    const timestamp = BigInt(trimmed);
    let unit = 'Seconds';
    let milliseconds = timestamp * 1000n;

    if (digits.length > 10 && digits.length <= 13) {
      unit = 'Milliseconds';
      milliseconds = timestamp;
    } else if (digits.length > 13 && digits.length <= 16) {
      unit = 'Microseconds';
      milliseconds = timestamp / 1000n;
    } else if (digits.length > 16) {
      unit = 'Nanoseconds';
      milliseconds = timestamp / 1_000_000n;
    }

    return {
      date: new Date(Number(milliseconds)),
      type: 'Numeric timestamp',
      unit,
      normalized: milliseconds.toString(),
    };
  }

  return {
    date: new Date(trimmed),
    type: 'Date string',
    unit: 'Parsed by Date',
    normalized: '-',
  };
}

function formatDuration(milliseconds: number) {
  const absolute = Math.abs(milliseconds);
  const units = [
    { label: 'day', value: 86_400_000 },
    { label: 'hour', value: 3_600_000 },
    { label: 'minute', value: 60_000 },
    { label: 'second', value: 1_000 },
  ];
  const unit = units.find((item) => absolute >= item.value) ?? units[units.length - 1];
  const amount = Math.round(absolute / unit.value);
  const suffix = milliseconds > 0 ? 'from now' : 'ago';
  return `${amount} ${unit.label}${amount === 1 ? '' : 's'} ${suffix}`;
}

function TimeTool() {
  const [value, setValue] = useState(() => String(Date.now()));
  const [locale, setLocale] = useState('default');
  const [timeZone, setTimeZone] = useState('default');
  const [customFormat, setCustomFormat] = useState('YYYY-MM-DD HH:mm:ss');
  const inspection = useMemo(() => inspectDateInput(value), [value]);
  const date = inspection.date;
  const valid = !Number.isNaN(date.getTime());
  const now = new Date();
  const relative = valid ? formatDuration(date.getTime() - now.getTime()) : '-';
  const selectedLocale = locale === 'default' ? undefined : locale;
  const selectedTimeZone = timeZone === 'default' ? undefined : timeZone;
  const formatted = valid
    ? new Intl.DateTimeFormat(selectedLocale, {
        dateStyle: 'full',
        timeStyle: 'long',
        timeZone: selectedTimeZone,
      }).format(date)
    : 'Invalid date';
  const customFormatted = valid ? formatCustomDate(date, customFormat, selectedLocale, selectedTimeZone) : 'Invalid date';
  const selectedFormatPreset = (timeFormatPresetOptions as readonly string[]).includes(customFormat) ? customFormat : 'custom';
  const formatPresetOptions = [
    { label: 'Custom', value: 'custom' },
    ...timeFormatPresetOptions.map((option) => ({ label: option, value: option })),
  ];

  return (
    <section className="tool-surface">
      <ToolSection title="Input and format">
        <div className="inline-controls wide time-controls">
          <TextInputField label="Input" value={value} onChange={setValue} compact />
          <SelectField label="Locale" value={locale} options={localeOptions} onChange={setLocale} />
          <SelectField label="Time zone" value={timeZone} options={timeZoneOptions} onChange={setTimeZone} />
          <SelectField
            label="Format preset"
            value={selectedFormatPreset}
            options={formatPresetOptions}
            onChange={(nextFormat) => nextFormat !== 'custom' && setCustomFormat(nextFormat)}
          />
          <TextInputField label="Custom format" value={customFormat} onChange={setCustomFormat} compact />
          <ToolbarButton title="Use current time" variant="primary" onClick={() => setValue(String(Date.now()))}>
            <Clock3 size={16} />
            <span>Now</span>
          </ToolbarButton>
        </div>
      </ToolSection>

      <ToolSection title="Detected timestamp">
        <div className="metrics-row">
          <Stat label="Input type" value={inspection.type} />
          <Stat label="Detected unit" value={inspection.unit} />
          <Stat label="Unix seconds" value={valid ? Math.floor(date.getTime() / 1000) : '-'} />
          <Stat label="Unix milliseconds" value={valid ? date.getTime() : '-'} />
        </div>
      </ToolSection>

      <ToolSection title="Output">
        <div className="output-grid">
          <TextInputField label="Relative" value={relative} readOnly />
          <TextInputField label="Normalized ms" value={valid ? inspection.normalized : '-'} readOnly />
          <TextInputField label="Custom" value={customFormatted} readOnly />
          <TextInputField label="Formatted" value={formatted} readOnly />
          <TextInputField label="Local" value={valid ? date.toLocaleString() : 'Invalid date'} readOnly />
          <TextInputField label="ISO" value={valid ? date.toISOString() : 'Invalid date'} readOnly />
          <TextInputField label="UTC" value={valid ? date.toUTCString() : 'Invalid date'} readOnly />
          <TextInputField label="Current seconds" value={String(Math.floor(now.getTime() / 1000))} readOnly />
          <TextInputField label="Current ms" value={String(now.getTime())} readOnly />
        </div>
      </ToolSection>
    </section>
  );
}
export { TimeTool };
