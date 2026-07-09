import { useMemo, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { SelectField } from '../components/SelectField';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid, SplitTextAreas } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import { localeOptions, timeFormatPresetOptions, timeZoneOptions } from '../config/options';
import { formatBatchTimestamps, formatCustomDate, formatDuration, inspectDateInput, timeDefaults } from './time/timeUtils';

function TimeTool() {
  const [value, setValue] = useState(() => String(Date.now()));
  const [batchInput, setBatchInput] = useState(timeDefaults.batchInput);
  const [batchOutput, setBatchOutput] = useState(timeDefaults.batchOutput);
  const [locale, setLocale] = useState(timeDefaults.locale);
  const [timeZone, setTimeZone] = useState(timeDefaults.timeZone);
  const [customFormat, setCustomFormat] = useState(timeDefaults.customFormat);
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
  const selectedFormatPreset = (timeFormatPresetOptions as readonly string[]).includes(customFormat) ? customFormat : timeDefaults.formatPreset;
  const formatPresetOptions = [
    { label: 'Custom', value: timeDefaults.formatPreset },
    ...timeFormatPresetOptions.map((option) => ({ label: option, value: option })),
  ];
  const detectedItems = [
    { label: 'Input type', value: inspection.type },
    { label: 'Detected unit', value: inspection.unit },
    { label: 'Unix seconds', value: valid ? String(Math.floor(date.getTime() / 1000)) : '-' },
    { label: 'Unix milliseconds', value: valid ? String(date.getTime()) : '-' },
  ];
  const outputItems = [
    { label: 'Custom', value: customFormatted },
    { label: 'Formatted', value: formatted },
    { label: 'Local', value: valid ? date.toLocaleString() : 'Invalid date' },
    { label: 'ISO', value: valid ? date.toISOString() : 'Invalid date' },
    { label: 'UTC', value: valid ? date.toUTCString() : 'Invalid date' },
    { label: 'Relative', value: relative },
    { label: 'Normalized ms', value: valid ? inspection.normalized : '-' },
    { label: 'Current seconds', value: String(Math.floor(now.getTime() / 1000)) },
    { label: 'Current ms', value: String(now.getTime()) },
  ];
  const batchLines = batchInput.split(/\r?\n/).filter((line) => line.trim()).length;
  const batchMetricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Batch rows', value: batchLines || '-' },
      { label: 'Format', value: customFormat },
      { label: 'Locale', value: locale },
      { label: 'Time zone', value: timeZone },
    ],
    [batchLines, customFormat, locale, timeZone],
  );

  function formatBatch() {
    setBatchOutput(formatBatchTimestamps(batchInput, customFormat, selectedLocale, selectedTimeZone));
  }

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
          <ToolbarButton title="Use current time" variant="primary" icon={<Clock3 size={16} />} label="Now" onClick={() => setValue(String(Date.now()))} />
        </div>
      </ToolSection>

      <ToolSection title="Detected timestamp">
        <div className="time-summary-list">
          {detectedItems.map((item) => (
            <div className="time-summary-item" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </ToolSection>

      <ToolSection title="Output">
        <div className="time-output-list">
          {outputItems.map((item) => (
            <div className="time-output-item" key={item.label}>
              <span>{item.label}</span>
              <code>{item.value}</code>
            </div>
          ))}
        </div>
      </ToolSection>

      <ToolSection title="Batch conversion">
        <SplitTextAreas
          compact
          left={{ label: 'Batch input', value: batchInput, onChange: setBatchInput }}
          right={{ label: 'Batch output', value: batchOutput, onChange: setBatchOutput }}
        />
        <ActionBar>
          <ToolbarButton title="Convert batch timestamps" variant="primary" icon={<Clock3 size={16} />} label="Convert batch" onClick={formatBatch} />
          <CopyButton title="Copy batch output" value={batchOutput} />
        </ActionBar>
        <MetricsGrid items={batchMetricsItems} />
      </ToolSection>
    </section>
  );
}
export { TimeTool };
