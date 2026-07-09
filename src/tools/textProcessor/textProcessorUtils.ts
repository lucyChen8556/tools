import type { TextCaseMode } from '@/config/options';

type TextTransformId = 'trim' | 'sort' | 'dedupe';

const textProcessorDefaults = {
  input: 'Apple\nbanana\nApple\n  carrot  ',
  output: '',
  caseMode: 'none' as TextCaseMode,
  selectedTransforms: ['trim'] as TextTransformId[],
  dedupeIgnoreCase: false,
  dedupeTrimKey: true,
};

const textTransforms: Array<{ id: TextTransformId; label: string }> = [
  { id: 'trim', label: 'Trim lines' },
  { id: 'sort', label: 'Sort lines' },
  { id: 'dedupe', label: 'Dedupe lines' },
];

function splitWords(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .match(/[\p{L}\p{N}]+/gu) ?? [];
}

function capitalizeWord(value: string) {
  return value ? `${value[0].toUpperCase()}${value.slice(1).toLowerCase()}` : '';
}

function formatWords(value: string, mode: TextCaseMode) {
  const words = splitWords(value);
  if (words.length === 0) return '';

  if (mode === 'slug') return words.map((word) => word.toLowerCase()).join('-');
  if (mode === 'snake') return words.map((word) => word.toLowerCase()).join('_');
  if (mode === 'camel') {
    const [firstWord, ...restWords] = words;
    return `${(firstWord ?? '').toLowerCase()}${restWords.map(capitalizeWord).join('')}`;
  }
  if (mode === 'pascal') return words.map(capitalizeWord).join('');
  if (mode === 'constant') return words.map((word) => word.toUpperCase()).join('_');
  return value;
}

function getDedupeKey(value: string, options: { ignoreCase: boolean; trimKey: boolean }) {
  const trimmed = options.trimKey ? value.trim() : value;
  return options.ignoreCase ? trimmed.toLocaleLowerCase() : trimmed;
}

function applyCase(value: string, caseMode: TextCaseMode) {
  if (caseMode === 'upper') return value.toUpperCase();
  if (caseMode === 'lower') return value.toLowerCase();
  if (caseMode === 'title') return value.toLowerCase().replace(/\b\p{L}/gu, (char) => char.toUpperCase());
  if (['slug', 'snake', 'camel', 'pascal', 'constant'].includes(caseMode)) {
    return value
      .split(/\r?\n/)
      .map((line) => formatWords(line, caseMode))
      .join('\n');
  }
  return value;
}

function runTextTransforms(
  value: string,
  options: {
    caseMode: TextCaseMode;
    selectedTransforms: TextTransformId[];
    dedupeIgnoreCase: boolean;
    dedupeTrimKey: boolean;
  },
) {
  let next = applyCase(value, options.caseMode);

  textTransforms.forEach((transform) => {
    if (!options.selectedTransforms.includes(transform.id)) return;

    const nextLines = next.split(/\r?\n/);
    if (transform.id === 'trim') {
      next = nextLines.map((line) => line.trim()).join('\n');
    }
    if (transform.id === 'sort') {
      next = [...nextLines].sort((a, b) => a.localeCompare(b)).join('\n');
    }
    if (transform.id === 'dedupe') {
      const seen = new Set<string>();
      next = nextLines
        .filter((line) => {
          const key = getDedupeKey(line, { ignoreCase: options.dedupeIgnoreCase, trimKey: options.dedupeTrimKey });
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .join('\n');
    }
  });

  return next;
}

function countDuplicateLines(lines: string[], options: { ignoreCase: boolean; trimKey: boolean }) {
  return lines.length - new Set(lines.map((line) => getDedupeKey(line, options))).size;
}

export { countDuplicateLines, runTextTransforms, textProcessorDefaults, textTransforms };
export type { TextTransformId };
