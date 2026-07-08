import { useMemo, useState } from 'react';
import { CopyButton } from '../components/CopyButton';
import { SelectField } from '../components/SelectField';
import { SplitTextAreas } from '../components/ToolLayout';
import { csvDelimiterOptions, type CsvDelimiterId } from '../config/options';
import { csvDefaults, csvRowsToObjects, parseCsv } from './csv/csvUtils';

function CsvTool() {
  const [input, setInput] = useState(csvDefaults.input);
  const [delimiter, setDelimiter] = useState<CsvDelimiterId>(csvDefaults.delimiter);
  const selectedDelimiter = csvDelimiterOptions.find((option) => option.value === delimiter) ?? csvDelimiterOptions[0];
  const rows = useMemo(() => parseCsv(input, selectedDelimiter.delimiter), [input, selectedDelimiter.delimiter]);
  const json = useMemo(() => JSON.stringify(csvRowsToObjects(rows), null, 2), [rows]);

  return (
    <section className="tool-surface">
      <div className="inline-controls">
        <SelectField label="Delimiter" value={delimiter} options={csvDelimiterOptions} onChange={setDelimiter} />
        <CopyButton title="Copy JSON" value={json} label="JSON" />
      </div>
      <SplitTextAreas left={{ label: 'CSV / Excel', value: input, onChange: setInput }} right={{ label: 'JSON', value: json, readOnly: true }} />
      <div className="table-wrap">
        <table>
          <tbody>
            {rows.slice(0, 12).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  rowIndex === 0 ? <th key={cellIndex}>{cell}</th> : <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export { CsvTool };
