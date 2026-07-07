import { useMemo, useState } from 'react';
import { CalendarDays, RotateCcw } from 'lucide-react';
import { CheckboxControl } from '../components/CheckboxControl';
import { CopyButton } from '../components/CopyButton';
import { SelectField } from '../components/SelectField';
import { TextAreaField } from '../components/TextAreaField';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import {
  calculateWorkdayDeadline,
  getTodayDateInputValue,
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
  const [holidayInput, setHolidayInput] = useState(workdayDefaults.holidayInput);

  const result = useMemo(
    () => calculateWorkdayDeadline({ dayCount, direction, excludeWeekends, holidayInput, startDate }),
    [dayCount, direction, excludeWeekends, holidayInput, startDate],
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
    setHolidayInput(workdaySample.holidayInput);
  }

  function useToday() {
    setStartDate(getTodayDateInputValue());
  }

  return (
    <section className="tool-surface">
      <ToolSection title="Deadline">
        <div className="inline-controls wide time-controls">
          <TextInputField label="Start date" type="date" value={startDate} onChange={setStartDate} compact />
          <SelectField label="Direction" value={direction} options={workdayDirectionOptions} onChange={setDirection} />
          <TextInputField label="Days" type="number" min={0} step={1} value={dayCount} onChange={setDayCount} compact />
          <CheckboxControl label="Exclude weekends" checked={excludeWeekends} onChange={setExcludeWeekends} />
        </div>
      </ToolSection>

      <ToolSection title="Holidays">
        <TextAreaField label="Custom holidays" value={holidayInput} onChange={setHolidayInput} spellCheck={false} />
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
