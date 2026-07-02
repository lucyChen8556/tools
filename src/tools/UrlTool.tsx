import { useEffect, useMemo, useState } from 'react';
import { Copy, Plus, Trash2 } from 'lucide-react';
import { Field } from '../components/Field';
import { Stat } from '../components/Stat';
import { ToolbarButton } from '../components/ToolbarButton';
import { copyText } from '../utils/clipboard';

type QueryRow = {
  id: string;
  key: string;
  value: string;
};

function parseUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { url: null, error: 'Enter a URL', relative: false };

  try {
    return { url: new URL(trimmed), error: '', relative: false };
  } catch {
    try {
      return { url: new URL(trimmed, 'https://example.com'), error: '', relative: true };
    } catch (error) {
      return { url: null, error: error instanceof Error ? error.message : 'Invalid URL', relative: false };
    }
  }
}

function rowsFromUrl(url: URL | null) {
  if (!url) return [];
  return Array.from(url.searchParams.entries()).map(([key, value], index) => ({
    id: `${index}-${key}-${value}`,
    key,
    value,
  }));
}

function buildUrl(url: URL | null, rows: QueryRow[], relative: boolean) {
  if (!url) return '';
  const next = new URL(url.toString());
  next.search = '';
  rows.forEach((row) => {
    if (row.key.trim()) next.searchParams.append(row.key, row.value);
  });
  return relative ? `${next.pathname}${next.search}${next.hash}` : next.toString();
}

function UrlTool() {
  const [input, setInput] = useState('https://example.com/docs?page=1&sort=desc#intro');
  const parsed = useMemo(() => parseUrl(input), [input]);
  const [queryRows, setQueryRows] = useState<QueryRow[]>(() => rowsFromUrl(parsed.url));
  const rebuilt = useMemo(() => buildUrl(parsed.url, queryRows, parsed.relative), [parsed.relative, parsed.url, queryRows]);

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

  return (
    <section className="tool-surface">
      <Field label="URL">
        <input value={input} onChange={(event) => setInput(event.target.value)} />
      </Field>
      {parsed.error ? <div className="notice error">{parsed.error}</div> : null}
      <div className="metrics-row">
        <Stat label="Mode" value={parsed.relative ? 'Relative' : 'Absolute'} />
        <Stat label="Query params" value={queryRows.length} />
        <Stat label="Path segments" value={parsed.url ? parsed.url.pathname.split('/').filter(Boolean).length : '-'} />
        <Stat label="Has hash" value={parsed.url?.hash ? 'Yes' : 'No'} />
      </div>
      <div className="output-grid">
        <Field label="Protocol">
          <input readOnly value={parsed.url ? parsed.url.protocol.replace(':', '') || '-' : '-'} />
        </Field>
        <Field label="Host">
          <input readOnly value={parsed.relative ? '(relative URL)' : parsed.url?.host ?? '-'} />
        </Field>
        <Field label="Path">
          <input readOnly value={parsed.url?.pathname ?? '-'} />
        </Field>
        <Field label="Hash">
          <input readOnly value={parsed.url?.hash ?? '-'} />
        </Field>
        <Field label="Origin">
          <input readOnly value={parsed.relative ? '(relative URL)' : parsed.url?.origin ?? '-'} />
        </Field>
        <Field label="Search">
          <input readOnly value={parsed.url?.search ?? '-'} />
        </Field>
      </div>
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
      <div className="action-bar">
        <ToolbarButton title="Add query parameter" variant="primary" onClick={addRow} disabled={!parsed.url}>
          <Plus size={16} />
          <span>Add param</span>
        </ToolbarButton>
        <ToolbarButton title="Copy rebuilt URL" onClick={() => copyText(rebuilt)} disabled={!rebuilt}>
          <Copy size={16} />
          <span>Copy URL</span>
        </ToolbarButton>
      </div>
      <Field label="Rebuilt URL">
        <input readOnly value={rebuilt || '-'} />
      </Field>
    </section>
  );
}

export { UrlTool };
