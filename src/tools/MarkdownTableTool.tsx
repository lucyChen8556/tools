import { useMemo, useState } from 'react';
import { Table2 } from 'lucide-react';
import { ApplyTextButton } from '../components/ApplyTextButton';
import { CopyButton } from '../components/CopyButton';
import { ActionBar, MetricsGrid, SplitTextAreas } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolbarButton } from '../components/ToolbarButton';
import { formatMarkdownTable, parseMarkdownTable } from './markdownTable/markdownTableUtils';

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
  const metricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Rows', value: parsed.rows.length || '-' },
      { label: 'Columns', value: parsed.columnCount || '-' },
      { label: 'Separator row', value: parsed.skippedSeparator ? 'Detected' : 'Generated' },
      { label: 'Output chars', value: output.length || '-' },
    ],
    [output.length, parsed.columnCount, parsed.rows.length, parsed.skippedSeparator],
  );

  function format() {
    setOutput(formatMarkdownTable(input));
  }

  return (
    <section className="tool-surface">
      <SplitTextAreas left={{ label: 'Input', value: input, onChange: setInput }} right={{ label: 'Output', value: output, onChange: setOutput }} />
      <ActionBar>
        <ToolbarButton title="Format markdown table" variant="primary" icon={<Table2 size={16} />} label="Format table" onClick={format} />
        <ApplyTextButton value={output} onApply={setInput} />
        <CopyButton title="Copy formatted table" value={output} />
      </ActionBar>
      <MetricsGrid items={metricsItems} />
    </section>
  );
}

export { MarkdownTableTool };
