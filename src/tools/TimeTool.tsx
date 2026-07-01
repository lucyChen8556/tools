import { useMemo, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { Field } from '../components/Field';
import { Stat } from '../components/Stat';
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

function TimeTool() {
  const [value, setValue] = useState(() => String(Date.now()));
  const [locale, setLocale] = useState('default');
  const [timeZone, setTimeZone] = useState('default');
  const [customFormat, setCustomFormat] = useState('YYYY-MM-DD HH:mm:ss');
  const date = useMemo(() => {
    const trimmed = value.trim();
    if (/^\d{10}$/.test(trimmed)) return new Date(Number(trimmed) * 1000);
    if (/^\d{13}$/.test(trimmed)) return new Date(Number(trimmed));
    return new Date(trimmed);
  }, [value]);
  const valid = !Number.isNaN(date.getTime());
  const now = new Date();
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

  return (
    <section className="tool-surface">
      <div className="inline-controls wide">
        <Field label="Input" compact>
          <input value={value} onChange={(event) => setValue(event.target.value)} />
        </Field>
        <Field label="Locale" compact>
          <select value={locale} onChange={(event) => setLocale(event.target.value)}>
            {localeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Time zone" compact>
          <select value={timeZone} onChange={(event) => setTimeZone(event.target.value)}>
            {timeZoneOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Custom format" compact>
          <input list="time-format-presets" value={customFormat} onChange={(event) => setCustomFormat(event.target.value)} />
          <datalist id="time-format-presets">
            {timeFormatPresetOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </Field>
        <ToolbarButton title="Use current time" variant="primary" onClick={() => setValue(String(Date.now()))}>
          <Clock3 size={16} />
          <span>Now</span>
        </ToolbarButton>
      </div>
      <div className="metrics-row">
        <Stat label="Unix seconds" value={valid ? Math.floor(date.getTime() / 1000) : '-'} />
        <Stat label="Unix milliseconds" value={valid ? date.getTime() : '-'} />
        <Stat label="Current seconds" value={Math.floor(now.getTime() / 1000)} />
        <Stat label="Current ms" value={now.getTime()} />
      </div>
      <div className="output-grid">
        <Field label="Custom">
          <input readOnly value={customFormatted} />
        </Field>
        <Field label="Formatted">
          <input readOnly value={formatted} />
        </Field>
        <Field label="Local">
          <input readOnly value={valid ? date.toLocaleString() : 'Invalid date'} />
        </Field>
        <Field label="ISO">
          <input readOnly value={valid ? date.toISOString() : 'Invalid date'} />
        </Field>
        <Field label="UTC">
          <input readOnly value={valid ? date.toUTCString() : 'Invalid date'} />
        </Field>
      </div>
    </section>
  );
}
export { TimeTool };
