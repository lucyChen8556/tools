type TableParseResult = {
  rows: string[][];
  columnCount: number;
  skippedSeparator: boolean;
};

function normalizeTableLine(line: string) {
  const trimmed = line.trim();
  return trimmed.replace(/^\|/, '').replace(/\|$/, '');
}

function isSeparatorRow(cells: string[]) {
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function parseMarkdownTable(value: string): TableParseResult {
  const rows = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.includes('|'))
    .map((line) => normalizeTableLine(line).split('|').map((cell) => cell.trim()));
  const skippedSeparator = rows.length > 1 && isSeparatorRow(rows[1]);
  const dataRows = skippedSeparator ? [rows[0], ...rows.slice(2)] : rows;
  const columnCount = Math.max(0, ...dataRows.map((row) => row.length));

  return {
    rows: dataRows.map((row) => [...row, ...Array(Math.max(0, columnCount - row.length)).fill('')]),
    columnCount,
    skippedSeparator,
  };
}

function formatMarkdownTable(value: string) {
  const parsed = parseMarkdownTable(value);
  if (parsed.rows.length === 0 || parsed.columnCount === 0) return '';

  const widths = Array.from({ length: parsed.columnCount }, (_, columnIndex) =>
    Math.max(3, ...parsed.rows.map((row) => row[columnIndex]?.length ?? 0)),
  );
  const renderRow = (row: string[]) => `| ${row.map((cell, index) => cell.padEnd(widths[index])).join(' | ')} |`;
  const separator = `| ${widths.map((width) => '-'.repeat(width)).join(' | ')} |`;
  const [header, ...body] = parsed.rows;

  return [renderRow(header), separator, ...body.map(renderRow)].join('\n');
}

export { formatMarkdownTable, parseMarkdownTable };
export type { TableParseResult };
