import { useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import { Field } from '../components/Field';
import { ToolbarButton } from '../components/ToolbarButton';
import { csvDelimiterOptions, type CsvDelimiterId } from '../config/options';
import { copyText } from '../utils/clipboard';
import { csvRowsToObjects, parseCsv } from '../utils/csv';

function CsvTool() {
  const [input, setInput] = useState('key,zhTW,enUS\nsave,儲存,Save\ncancel,取消,Cancel');
  const [delimiter, setDelimiter] = useState<CsvDelimiterId>('comma');
  const selectedDelimiter = csvDelimiterOptions.find((option) => option.value === delimiter) ?? csvDelimiterOptions[0];
  const rows = useMemo(() => parseCsv(input, selectedDelimiter.delimiter), [input, selectedDelimiter.delimiter]);
  const json = useMemo(() => JSON.stringify(csvRowsToObjects(rows), null, 2), [rows]);

  return (
    <section className="tool-surface">
      <div className="inline-controls">
        <Field label="Delimiter" compact>
          <select value={delimiter} onChange={(event) => setDelimiter(event.target.value as CsvDelimiterId)}>
            {csvDelimiterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <ToolbarButton title="Copy JSON" onClick={() => copyText(json)}>
          <Copy size={16} />
          <span>JSON</span>
        </ToolbarButton>
      </div>
      <div className="split-editor">
        <Field label="CSV / Excel">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} />
        </Field>
        <Field label="JSON">
          <textarea value={json} readOnly />
        </Field>
      </div>
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
