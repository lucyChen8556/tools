const textCleanerSample =
  '  Product update　　has full-width spaces  \r\n\r\n' +
  'Second line   has   extra spaces\r\n' +
  'Feature list item one\r\n' +
  'Feature list item two\r\n\r\n' +
  'Email draft:Hello,team,please review this before release.\r\n' +
  'Release notes:Added JWT decoder,improved Time Converter,fixed Regex reference scroll.\r\n' +
  'CSV-like values:alpha,beta,gamma\r\n' +
  'Keep number formatting:1,000 users,2,500 events\r\n' +
  '  Trim this line before and after  ';

const cleanerActions = [
  { id: 'normalize-newlines', label: 'Normalize line endings' },
  { id: 'fullwidth-space', label: 'Convert full-width spaces' },
  { id: 'trim-lines', label: 'Trim lines' },
  { id: 'collapse-space', label: 'Collapse extra spaces' },
  { id: 'space-after-comma', label: 'Add space after English comma' },
  { id: 'remove-empty', label: 'Remove empty lines' },
  { id: 'one-line', label: 'Compress to one line' },
  { id: 'lines-to-comma', label: 'Lines to comma-separated' },
  { id: 'comma-to-lines', label: 'Comma-separated to lines' },
] as const;

type CleanerActionId = (typeof cleanerActions)[number]['id'];

const defaultCleanerActions: CleanerActionId[] = [
  'normalize-newlines',
  'fullwidth-space',
  'trim-lines',
  'collapse-space',
  'remove-empty',
];

function normalizeLineEndings(value: string) {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function isThousandsSeparator(value: string, commaIndex: number) {
  const leftDigits = value.slice(0, commaIndex).match(/\d+$/)?.[0] ?? '';
  const rightThousandsGroup = /^\d{3}(?!\d)/.test(value.slice(commaIndex + 1));
  return leftDigits.length >= 1 && leftDigits.length <= 3 && rightThousandsGroup;
}

function addSpaceAfterEnglishComma(value: string) {
  return value.replace(/,([^\s])/g, (match, next: string, offset: number, source: string) => {
    if (isThousandsSeparator(source, offset)) return match;
    return `, ${next}`;
  });
}

function commaSeparatedToLines(value: string) {
  const items: string[] = [];
  let current = '';

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    const shouldSplit = character === '，' || (character === ',' && !isThousandsSeparator(value, index));

    if (shouldSplit) {
      items.push(current);
      current = '';
    } else {
      current += character;
    }
  }

  items.push(current);

  return items
    .map((item) => item.trim())
    .filter(Boolean)
    .join('\n');
}

function applyCleanerAction(value: string, action: CleanerActionId) {
  const normalized = normalizeLineEndings(value);
  const lines = normalized.split('\n');

  switch (action) {
    case 'normalize-newlines':
      return normalized;
    case 'fullwidth-space':
      return normalized.replace(/\u3000/g, ' ');
    case 'trim-lines':
      return lines.map((line) => line.trim()).join('\n').trim();
    case 'collapse-space':
      return lines.map((line) => line.replace(/[ \t]+/g, ' ')).join('\n');
    case 'space-after-comma':
      return addSpaceAfterEnglishComma(normalized);
    case 'remove-empty':
      return lines.filter((line) => line.trim().length > 0).join('\n');
    case 'one-line':
      return lines
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' ');
    case 'lines-to-comma':
      return lines
        .map((line) => line.trim())
        .filter(Boolean)
        .join(', ');
    case 'comma-to-lines':
      return commaSeparatedToLines(normalized);
  }
}

function cleanText(value: string, actions: CleanerActionId[]) {
  const selected = cleanerActions.filter((action) => actions.includes(action.id));
  return selected.reduce((current, action) => applyCleanerAction(current, action.id), value);
}

export { cleanerActions, cleanText, defaultCleanerActions, normalizeLineEndings, textCleanerSample };
export type { CleanerActionId };
