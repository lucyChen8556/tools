import { useMemo, useState } from 'react';
import { Table2 } from 'lucide-react';
import { ApplyTextButton } from '../components/ApplyTextButton';
import { CopyButton } from '../components/CopyButton';
import { ActionBar, MetricsGrid, SplitTextAreas } from '../components/ToolLayout';
import { ToolbarButton } from '../components/ToolbarButton';

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

function MarkdownTableTool() {
  const [input, setInput] = useState(
    '| Feature | Status| Owner |\n' +
      '|---|---|---|\n' +
      '| JWT decoder | done | Lucy |\n' +
      '| Time batch converter|in progress|Platform |\n' +
      '| Regex reference scroll | fixed |\n',
  );
  const [output, setOutput] = useState('');
  const parsed = useMemo(() => parseMarkdownTable(input), [input]);

  function format() {
    setOutput(formatMarkdownTable(input));
  }

  return (
    <section className="tool-surface">
      <SplitTextAreas left={{ label: 'Input', value: input, onChange: setInput }} right={{ label: 'Output', value: output, onChange: setOutput }} />
      <ActionBar>
        <ToolbarButton title="Format markdown table" variant="primary" onClick={format}>
          <Table2 size={16} />
          <span>Format table</span>
        </ToolbarButton>
        <ApplyTextButton value={output} onApply={setInput} />
        <CopyButton title="Copy formatted table" value={output} />
      </ActionBar>
      <MetricsGrid
        items={[
          { label: 'Rows', value: parsed.rows.length || '-' },
          { label: 'Columns', value: parsed.columnCount || '-' },
          { label: 'Separator row', value: parsed.skippedSeparator ? 'Detected' : 'Generated' },
          { label: 'Output chars', value: output.length || '-' },
        ]}
      />
    </section>
  );
}

export { MarkdownTableTool };
