import { useEffect, useMemo, useState } from 'react';
import { ArrowDownAZ, Check, Plus, Trash2 } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import { buildUrl, parseUrl, removeEmptyQueryRows, rowsFromUrl, sortQueryRows, type QueryRow } from './url/urlUtils';

function UrlTool() {
  const [input, setInput] = useState('https://example.com/docs?page=1&sort=desc#intro');
  const parsed = useMemo(() => parseUrl(input), [input]);
  const [queryRows, setQueryRows] = useState<QueryRow[]>(() => rowsFromUrl(parsed.url));
  const rebuilt = useMemo(() => buildUrl(parsed.url, queryRows, parsed.relative), [parsed.relative, parsed.url, queryRows]);
  const metricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Mode', value: parsed.relative ? 'Relative' : 'Absolute' },
      { label: 'Query params', value: queryRows.length },
      { label: 'Path segments', value: parsed.url ? parsed.url.pathname.split('/').filter(Boolean).length : '-' },
      { label: 'Has hash', value: parsed.url?.hash ? 'Yes' : 'No' },
    ],
    [parsed.relative, parsed.url, queryRows.length],
  );

  useEffect(() => {
    setQueryRows(rowsFromUrl(parsed.url));
  }, [parsed.url]);

  function updateRow(id: string, field: 'key' | 'value', value: string) {
    setQueryRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setQueryRows((current) => [...current, { id: `${Date.now()}-${current.length}`, key: '', value: '' }]);
  }

  function removeRow(id: string) {
    setQueryRows((current) => current.filter((row) => row.id !== id));
  }

  function sortRows() {
    setQueryRows(sortQueryRows);
  }

  function removeEmptyRows() {
    setQueryRows(removeEmptyQueryRows);
  }

  return (
    <section className="tool-surface">
      <ToolSection title="Input">
        <TextInputField label="URL" value={input} onChange={setInput} />
      </ToolSection>
      {parsed.error ? <div className="notice error">{parsed.error}</div> : null}
      <MetricsGrid items={metricsItems} />
      <ToolSection title="URL parts">
        <div className="output-grid">
          <TextInputField label="Protocol" value={parsed.url ? parsed.url.protocol.replace(':', '') || '-' : '-'} readOnly />
          <TextInputField label="Host" value={parsed.relative ? '(relative URL)' : parsed.url?.host ?? '-'} readOnly />
          <TextInputField label="Path" value={parsed.url?.pathname ?? '-'} readOnly />
          <TextInputField label="Hash" value={parsed.url?.hash ?? '-'} readOnly />
          <TextInputField label="Origin" value={parsed.relative ? '(relative URL)' : parsed.url?.origin ?? '-'} readOnly />
          <TextInputField label="Search" value={parsed.url?.search ?? '-'} readOnly />
        </div>
      </ToolSection>
      <ToolSection title="Query builder">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {queryRows.length === 0 ? (
                <tr>
                  <td colSpan={3}>No query parameters</td>
                </tr>
              ) : (
                queryRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input value={row.key} onChange={(event) => updateRow(row.id, 'key', event.target.value)} placeholder="key" />
                    </td>
                    <td>
                      <input value={row.value} onChange={(event) => updateRow(row.id, 'value', event.target.value)} placeholder="value" />
                    </td>
                    <td>
                      <button className="icon-button" type="button" onClick={() => removeRow(row.id)} title="Remove parameter">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <ActionBar>
          <ToolbarButton title="Add query parameter" variant="primary" onClick={addRow} disabled={!parsed.url}>
            <Plus size={16} />
            <span>Add param</span>
          </ToolbarButton>
          <ToolbarButton title="Sort query parameters" onClick={sortRows} disabled={!parsed.url || queryRows.length < 2}>
            <ArrowDownAZ size={16} />
            <span>Sort params</span>
          </ToolbarButton>
          <ToolbarButton title="Remove empty query parameters" onClick={removeEmptyRows} disabled={!parsed.url || queryRows.length === 0}>
            <Trash2 size={16} />
            <span>Remove empty</span>
          </ToolbarButton>
          <ToolbarButton title="Apply rebuilt URL to input" onClick={() => setInput(rebuilt)} disabled={!rebuilt}>
            <Check size={16} />
            <span>Apply URL</span>
          </ToolbarButton>
          <CopyButton title="Copy rebuilt URL" value={rebuilt} label="Copy URL" />
        </ActionBar>
        <TextInputField label="Rebuilt URL" value={rebuilt || '-'} readOnly />
      </ToolSection>
    </section>
  );
}

export { UrlTool };
