type WorkdayDirection = 'add' | 'subtract';

type WorkdayInput = {
  startDate: string;
  dayCount: string;
  direction: WorkdayDirection;
  excludeWeekends: boolean;
  holidayInput: string;
};

type WorkdayResult = {
  calendarDays: number;
  countedDays: number;
  deadline: string;
  deadlineLabel: string;
  directionLabel: string;
  error: string;
  holidayCount: number;
  holidaysSkipped: number;
  invalidHolidays: string[];
  startLabel: string;
  weekendsSkipped: number;
};

const workdayDirectionOptions = [
  { label: 'Add', value: 'add' },
  { label: 'Subtract', value: 'subtract' },
] as const;

const workdayDefaults = {
  dayCount: '10',
  direction: 'add' as WorkdayDirection,
  excludeWeekends: true,
  holidayInput: '',
};

const workdaySample = {
  startDate: '2026-07-07',
  dayCount: '10',
  direction: 'add' as WorkdayDirection,
  excludeWeekends: true,
  holidayInput: '2026-07-10\n2026-07-17',
};

function padDatePart(value: number) {
  return String(value).padStart(2, '0');
}

function formatDateOnly(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function getTodayDateInputValue() {
  return formatDateOnly(new Date());
}

function parseDateOnly(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function addCalendarDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function formatDisplayDate(date: Date) {
  const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date);
  return `${formatDateOnly(date)} (${weekday})`;
}

function parseHolidayInput(input: string) {
  const values = input
    .split(/[\s,;]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  const holidays = new Set<string>();
  const invalidHolidays: string[] = [];

  values.forEach((value) => {
    const date = parseDateOnly(value);
    if (date) {
      holidays.add(formatDateOnly(date));
      return;
    }
    invalidHolidays.push(value);
  });

  return {
    holidays,
    invalidHolidays,
  };
}

function readDayCount(value: string) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) return null;
  return Math.floor(numericValue);
}

function calculateWorkdayDeadline(input: WorkdayInput): WorkdayResult {
  const start = parseDateOnly(input.startDate);
  const dayCount = readDayCount(input.dayCount);
  const { holidays, invalidHolidays } = parseHolidayInput(input.holidayInput);
  const directionStep = input.direction === 'add' ? 1 : -1;
  const directionLabel = input.direction === 'add' ? 'Added' : 'Subtracted';

  if (!start) {
    return {
      calendarDays: 0,
      countedDays: 0,
      deadline: '',
      deadlineLabel: '-',
      directionLabel,
      error: 'Start date must be a valid YYYY-MM-DD date.',
      holidayCount: holidays.size,
      holidaysSkipped: 0,
      invalidHolidays,
      startLabel: '-',
      weekendsSkipped: 0,
    };
  }

  if (dayCount === null) {
    return {
      calendarDays: 0,
      countedDays: 0,
      deadline: '',
      deadlineLabel: '-',
      directionLabel,
      error: 'Days must be zero or greater.',
      holidayCount: holidays.size,
      holidaysSkipped: 0,
      invalidHolidays,
      startLabel: formatDisplayDate(start),
      weekendsSkipped: 0,
    };
  }

  let current = new Date(start);
  let countedDays = 0;
  let calendarDays = 0;
  let weekendsSkipped = 0;
  let holidaysSkipped = 0;

  while (countedDays < dayCount) {
    current = addCalendarDays(current, directionStep);
    calendarDays += 1;

    const holidayKey = formatDateOnly(current);
    if (input.excludeWeekends && isWeekend(current)) {
      weekendsSkipped += 1;
      continue;
    }

    if (holidays.has(holidayKey)) {
      holidaysSkipped += 1;
      continue;
    }

    countedDays += 1;
  }

  return {
    calendarDays,
    countedDays,
    deadline: formatDateOnly(current),
    deadlineLabel: formatDisplayDate(current),
    directionLabel,
    error: '',
    holidayCount: holidays.size,
    holidaysSkipped,
    invalidHolidays,
    startLabel: formatDisplayDate(start),
    weekendsSkipped,
  };
}

export { calculateWorkdayDeadline, getTodayDateInputValue, workdayDefaults, workdayDirectionOptions, workdaySample };
export type { WorkdayDirection, WorkdayInput, WorkdayResult };
