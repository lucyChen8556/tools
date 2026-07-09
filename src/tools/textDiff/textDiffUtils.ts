import type { DiffOp } from '@/types';

const textDiffDefaults = {
  oldText: 'A\nB\nC\nD',
  newText: 'A\nA\nE\nC',
  ignoreWhitespace: false,
  view: 'diff' as TextDiffView,
};

const textDiffViewOptions = [
  { label: 'Diff', value: 'diff' },
  { label: 'Only A/B', value: 'only' },
] as const;

type TextDiffView = (typeof textDiffViewOptions)[number]['value'];

function normalizeLines(value: string, ignoreWhitespace: boolean) {
  return value.replace(/\r\n/g, '\n').split('\n').map((line) => (ignoreWhitespace ? line.trim() : line));
}

export function diffLines(oldText: string, newText: string, ignoreWhitespace: boolean): DiffOp[] {
  const oldLines = normalizeLines(oldText, ignoreWhitespace);
  const newLines = normalizeLines(newText, ignoreWhitespace);
  const matrix: number[][] = Array.from({ length: oldLines.length + 1 }, () =>
    Array.from({ length: newLines.length + 1 }, () => 0),
  );

  for (let i = oldLines.length - 1; i >= 0; i -= 1) {
    for (let j = newLines.length - 1; j >= 0; j -= 1) {
      matrix[i][j] =
        oldLines[i] === newLines[j] ? matrix[i + 1][j + 1] + 1 : Math.max(matrix[i + 1][j], matrix[i][j + 1]);
    }
  }

  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;

  while (i < oldLines.length && j < newLines.length) {
    if (oldLines[i] === newLines[j]) {
      ops.push({ type: 'same', oldText: oldLines[i], newText: newLines[j] });
      i += 1;
      j += 1;
    } else if (matrix[i + 1][j] >= matrix[i][j + 1]) {
      ops.push({ type: 'removed', oldText: oldLines[i] });
      i += 1;
    } else {
      ops.push({ type: 'added', newText: newLines[j] });
      j += 1;
    }
  }

  while (i < oldLines.length) {
    ops.push({ type: 'removed', oldText: oldLines[i] });
    i += 1;
  }
  while (j < newLines.length) {
    ops.push({ type: 'added', newText: newLines[j] });
    j += 1;
  }

  const compacted: DiffOp[] = [];
  for (let index = 0; index < ops.length; index += 1) {
    const current = ops[index];
    const next = ops[index + 1];
    if (current.type === 'removed' && next?.type === 'added') {
      compacted.push({ type: 'changed', oldText: current.oldText, newText: next.newText });
      index += 1;
    } else {
      compacted.push(current);
    }
  }

  return compacted;
}

function getUniqueLines(lines: string[]) {
  return Array.from(new Set(lines.filter((line) => line.length > 0)));
}

function getOnlyInSides(oldText: string, newText: string, ignoreWhitespace: boolean) {
  const oldLines = getUniqueLines(normalizeLines(oldText, ignoreWhitespace));
  const newLines = getUniqueLines(normalizeLines(newText, ignoreWhitespace));
  const oldLineSet = new Set(oldLines);
  const newLineSet = new Set(newLines);

  return {
    onlyInA: oldLines.filter((line) => !newLineSet.has(line)),
    onlyInB: newLines.filter((line) => !oldLineSet.has(line)),
  };
}

function formatOnlyInSides(onlyInA: string[], onlyInB: string[]) {
  return [
    'Only in A',
    ...(onlyInA.length > 0 ? onlyInA.map((line) => `- ${line}`) : ['- None']),
    '',
    'Only in B',
    ...(onlyInB.length > 0 ? onlyInB.map((line) => `+ ${line}`) : ['+ None']),
  ].join('\n');
}

export { formatOnlyInSides, getOnlyInSides, textDiffDefaults, textDiffViewOptions };
export type { TextDiffView };
