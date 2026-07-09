import { useMemo, useState } from 'react';
import { CopyButton } from '@/components/CopyButton';
import { DataTable } from '@/components/DataTable';
import type { DataTableColumn } from '@/components/DataTable';
import { SelectField } from '@/components/SelectField';
import { SplitTextAreas } from '@/components/ToolLayout';
import { csvDelimiterOptions, type CsvDelimiterId } from '@/config/options';
import { csvDefaults, csvRowsToObjects, parseCsv } from './csv/csvUtils';

function CsvTool() {
  const [input, setInput] = useState(csvDefaults.input);
  const [delimiter, setDelimiter] = useState<CsvDelimiterId>(csvDefaults.delimiter);
  const selectedDelimiter = csvDelimiterOptions.find((option) => option.value === delimiter) ?? csvDelimiterOptions[0];
  const rows = useMemo(() => parseCsv(input, selectedDelimiter.delimiter), [input, selectedDelimiter.delimiter]);
  const json = useMemo(() => JSON.stringify(csvRowsToObjects(rows), null, 2), [rows]);
  const previewRows = useMemo(() => rows.slice(1, 12), [rows]);
  const previewColumns = useMemo<Array<DataTableColumn<string[]>>>(() => {
    const preview = rows.slice(0, 12);
    const columnCount = Math.max(0, ...preview.map((row) => row.length));

    return Array.from({ length: columnCount }, (_, index) => ({
      key: `column-${index}`,
      header: rows[0]?.[index] || `Column ${index + 1}`,
      cell: (row) => row[index] ?? '',
    }));
  }, [rows]);

  return (
    <section className="tool-surface">
      <div className="inline-controls">
        <SelectField label="Delimiter" value={delimiter} options={csvDelimiterOptions} onChange={setDelimiter} />
        <CopyButton title="Copy JSON" value={json} label="JSON" />
      </div>
      <SplitTextAreas left={{ label: 'CSV / Excel', value: input, onChange: setInput }} right={{ label: 'JSON', value: json, readOnly: true }} />
      <DataTable columns={previewColumns} rows={previewRows} emptyMessage="No preview rows" />
    </section>
  );
}
export { CsvTool };
