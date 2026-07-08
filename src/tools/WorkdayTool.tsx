import { useMemo, useState } from 'react';
import { CalendarDays, Plus, RotateCcw, X } from 'lucide-react';
import { CheckboxControl } from '../components/CheckboxControl';
import { CopyButton } from '../components/CopyButton';
import { SelectField } from '../components/SelectField';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import {
  addHolidayDate,
  calculateWorkdayDeadline,
  formatHolidayLabel,
  getTodayDateInputValue,
  removeHolidayDate,
  workdayDefaults,
  workdayDirectionOptions,
  workdaySample,
  type WorkdayDirection,
} from './workday/workdayUtils';

function WorkdayTool() {
  const [startDate, setStartDate] = useState(getTodayDateInputValue);
  const [dayCount, setDayCount] = useState(workdayDefaults.dayCount);
  const [direction, setDirection] = useState<WorkdayDirection>(workdayDefaults.direction);
  const [excludeWeekends, setExcludeWeekends] = useState(workdayDefaults.excludeWeekends);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayDates, setHolidayDates] = useState<string[]>(workdayDefaults.holidayDates);

  const result = useMemo(
    () => calculateWorkdayDeadline({ dayCount, direction, excludeWeekends, holidayDates, startDate }),
    [dayCount, direction, excludeWeekends, holidayDates, startDate],
  );

  const metricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Deadline', value: result.deadlineLabel },
      { label: result.directionLabel, value: result.countedDays },
      { label: 'Calendar days', value: result.calendarDays },
      { label: 'Weekends skipped', value: result.weekendsSkipped || '-' },
      { label: 'Holidays skipped', value: result.holidaysSkipped || '-' },
      { label: 'Custom holidays', value: result.holidayCount || '-' },
    ],
    [result],
  );

  const summary = result.error
    ? ''
    : [
        `Start: ${result.startLabel}`,
        `${result.directionLabel}: ${result.countedDays} day${result.countedDays === 1 ? '' : 's'}`,
        `Deadline: ${result.deadlineLabel}`,
        `Calendar days: ${result.calendarDays}`,
        `Weekends skipped: ${result.weekendsSkipped}`,
        `Holidays skipped: ${result.holidaysSkipped}`,
      ].join('\n');

  function useSample() {
    setStartDate(workdaySample.startDate);
    setDayCount(workdaySample.dayCount);
    setDirection(workdaySample.direction);
    setExcludeWeekends(workdaySample.excludeWeekends);
    setHolidayDates(workdaySample.holidayDates);
    setHolidayDate('');
  }

  function useToday() {
    setStartDate(getTodayDateInputValue());
  }

  function addHoliday() {
    setHolidayDates((current) => addHolidayDate(current, holidayDate));
    setHolidayDate('');
  }

  return (
    <section className="tool-surface">
      <ToolSection title="Deadline">
        <div className="inline-controls wide time-controls">
          <TextInputField label="Start date" type="date" value={startDate} onChange={setStartDate} lang="en-US" compact />
          <SelectField label="Direction" value={direction} options={workdayDirectionOptions} onChange={setDirection} />
          <TextInputField label="Days" type="number" min={0} step={1} value={dayCount} onChange={setDayCount} compact />
          <CheckboxControl label="Exclude weekends" checked={excludeWeekends} onChange={setExcludeWeekends} />
        </div>
      </ToolSection>

      <ToolSection title="Holidays">
        <div className="inline-controls wide holiday-controls">
          <TextInputField label="Custom holiday" type="date" value={holidayDate} onChange={setHolidayDate} lang="en-US" compact />
          <ToolbarButton title="Add custom holiday" variant="primary" onClick={addHoliday} disabled={!holidayDate}>
            <Plus size={16} />
            <span>Add holiday</span>
          </ToolbarButton>
          <ToolbarButton title="Clear custom holidays" onClick={() => setHolidayDates([])} disabled={holidayDates.length === 0}>
            <X size={16} />
            <span>Clear holidays</span>
          </ToolbarButton>
        </div>
        {holidayDates.length ? (
          <div className="holiday-list" aria-label="Selected custom holidays">
            {holidayDates.map((date) => (
              <button
                className="holiday-chip"
                key={date}
                type="button"
                onClick={() => setHolidayDates((current) => removeHolidayDate(current, date))}
                title={`Remove ${date}`}
              >
                <span>{formatHolidayLabel(date)}</span>
                <X size={14} />
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state compact">No custom holidays selected</div>
        )}
        {result.invalidHolidays.length ? <div className="notice error">{`Invalid holidays: ${result.invalidHolidays.join(', ')}`}</div> : null}
      </ToolSection>

      <ToolSection title="Result">
        {result.error ? <div className="notice error">{result.error}</div> : null}
        <MetricsGrid items={metricsItems} />
        <div className="output-grid">
          <TextInputField label="Start" value={result.startLabel} readOnly />
          <TextInputField label="Deadline" value={result.deadlineLabel} readOnly />
          <TextInputField label="Date value" value={result.deadline || '-'} readOnly />
        </div>
        <ActionBar>
          <ToolbarButton title="Set start date to today" variant="primary" onClick={useToday}>
            <CalendarDays size={16} />
            <span>Today</span>
          </ToolbarButton>
          <ToolbarButton title="Load sample deadline calculation" onClick={useSample}>
            <RotateCcw size={16} />
            <span>Sample</span>
          </ToolbarButton>
          <CopyButton title="Copy deadline summary" value={summary} label="Copy summary" />
        </ActionBar>
      </ToolSection>
    </section>
  );
}

export { WorkdayTool };
