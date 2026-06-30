import { ChangeEvent, ReactNode, useMemo, useState } from 'react';
import {
  ArrowDownUp,
  Braces,
  CaseSensitive,
  Check,
  Clipboard,
  Clock3,
  Code2,
  Copy,
  Diff,
  Download,
  Eraser,
  FileJson,
  FileSpreadsheet,
  ImageDown,
  Palette,
  Regex,
  Repeat2,
  Search,
  Shuffle,
  Star,
  StarOff,
  Type,
} from 'lucide-react';

type ToolId =
  | 'json'
  | 'text-diff'
  | 'text-cleaner'
  | 'time'
  | 'text'
  | 'image'
  | 'color'
  | 'regex'
  | 'encode'
  | 'csv';

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

type JsonDiff = {
  path: Array<string | number>;
  type: 'added' | 'removed' | 'changed' | 'type' | 'array-length';
  before?: JsonValue;
  after?: JsonValue;
};

type JsonMergeMode = 'full' | 'diff' | 'value';

type DiffOp = {
  type: 'same' | 'added' | 'removed' | 'changed';
  oldText?: string;
  newText?: string;
};

type RegexMatchResult = {
  text: string;
  index: number;
  groups: string[];
};

type HighlightSegment = {
  type: 'text' | 'match';
  text: string;
  index?: number;
};

const sampleLeftJson = `{
  "dashboard": {
    "title": "Order Center",
    "status": "Draft"
  },
  "version": 1
}`;

const sampleRightJson = `{
  "dashboard": {
    "title": "Order Center",
    "status": "Published",
    "owner": "Ops"
  },
  "version": 2
}`;

const tools: Array<{
  id: ToolId;
  name: string;
  shortName: string;
  group: string;
  icon: ReactNode;
}> = [
  { id: 'json', name: 'JSON Lab', shortName: 'JSON', group: 'Data', icon: <Braces size={18} /> },
  { id: 'text-diff', name: 'What Changed?', shortName: 'Diff', group: 'Text', icon: <Diff size={18} /> },
  { id: 'text-cleaner', name: 'Text Cleaner', shortName: 'Clean', group: 'Text', icon: <Eraser size={18} /> },
  { id: 'time', name: 'Time Converter', shortName: 'Time', group: 'Time', icon: <Clock3 size={18} /> },
  { id: 'text', name: 'Text Processor', shortName: 'Text', group: 'Text', icon: <Type size={18} /> },
  { id: 'image', name: 'Image Compressor', shortName: 'Image', group: 'Media', icon: <ImageDown size={18} /> },
  { id: 'color', name: 'Color Converter', shortName: 'Color', group: 'Design', icon: <Palette size={18} /> },
  { id: 'regex', name: 'Regex Tester', shortName: 'Regex', group: 'Code', icon: <Regex size={18} /> },
  { id: 'encode', name: 'Encode / Decode', shortName: 'Codec', group: 'Code', icon: <Code2 size={18} /> },
  { id: 'csv', name: 'CSV / Excel Helper', shortName: 'CSV', group: 'Data', icon: <FileSpreadsheet size={18} /> },
];

const starterFavorites: ToolId[] = ['json', 'text-diff', 'regex'];

function readStoredToolId(key: string, fallback: ToolId): ToolId {
  const value = localStorage.getItem(key);
  return tools.some((tool) => tool.id === value) ? (value as ToolId) : fallback;
}

function readStoredToolList(key: string, fallback: ToolId[]): ToolId[] {
  const value = localStorage.getItem(key);
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return fallback;
    return parsed.filter((id): id is ToolId => tools.some((tool) => tool.id === id));
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
}

function cleanJsonInput(input: string) {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

function parseJson(input: string): JsonValue {
  return JSON.parse(cleanJsonInput(input)) as JsonValue;
}

function isPlainObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sortJson(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!isPlainObject(value)) return value;

  return Object.keys(value)
    .sort((a, b) => a.localeCompare(b))
    .reduce<{ [key: string]: JsonValue }>((sorted, key) => {
      sorted[key] = sortJson(value[key]);
      return sorted;
    }, {});
}

function cloneJson<T extends JsonValue>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function formatJson(value: JsonValue) {
  return JSON.stringify(sortJson(value), null, 2);
}

function jsonType(value: JsonValue) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

function diffJson(before: JsonValue, after: JsonValue, path: Array<string | number> = []): JsonDiff[] {
  const beforeType = jsonType(before);
  const afterType = jsonType(after);

  if (beforeType !== afterType) {
    return [{ path, type: 'type', before, after }];
  }

  if (Array.isArray(before) && Array.isArray(after)) {
    const diffs: JsonDiff[] = [];
    if (before.length !== after.length) {
      diffs.push({ path, type: 'array-length', before: before.length, after: after.length });
    }

    const max = Math.max(before.length, after.length);
    for (let index = 0; index < max; index += 1) {
      if (index >= before.length) {
        diffs.push({ path: [...path, index], type: 'added', after: after[index] });
      } else if (index >= after.length) {
        diffs.push({ path: [...path, index], type: 'removed', before: before[index] });
      } else {
        diffs.push(...diffJson(before[index], after[index], [...path, index]));
      }
    }
    return diffs;
  }

  if (isPlainObject(before) && isPlainObject(after)) {
    const diffs: JsonDiff[] = [];
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    Array.from(keys)
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        if (!(key in before)) {
          diffs.push({ path: [...path, key], type: 'added', after: after[key] });
        } else if (!(key in after)) {
          diffs.push({ path: [...path, key], type: 'removed', before: before[key] });
        } else {
          diffs.push(...diffJson(before[key], after[key], [...path, key]));
        }
      });
    return diffs;
  }

  if (before !== after) {
    return [{ path, type: 'changed', before, after }];
  }

  return [];
}

function pathLabel(path: Array<string | number>) {
  if (path.length === 0) return '$';
  return `$${path
    .map((part) => (typeof part === 'number' ? `[${part}]` : `.${part}`))
    .join('')}`;
}

function compactJson(value: JsonValue | undefined) {
  if (value === undefined) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function getJsonAtPath(root: JsonValue, path: Array<string | number>) {
  let current: JsonValue | undefined = root;
  for (const part of path) {
    if (Array.isArray(current) && typeof part === 'number') {
      current = current[part];
    } else if (isPlainObject(current) && typeof part === 'string') {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function setJsonAtPath(root: JsonValue, path: Array<string | number>, value: JsonValue) {
  if (path.length === 0) return value;

  let current = root;
  path.forEach((part, index) => {
    const last = index === path.length - 1;
    if (last) {
      if (Array.isArray(current) && typeof part === 'number') current[part] = value;
      if (isPlainObject(current) && typeof part === 'string') current[part] = value;
      return;
    }

    if (Array.isArray(current) && typeof part === 'number') {
      current = current[part];
    } else if (isPlainObject(current) && typeof part === 'string') {
      current = current[part];
    }
  });

  return root;
}

function mergeJsonObjects(before: JsonValue, after: JsonValue): JsonValue {
  if (Array.isArray(before) || Array.isArray(after)) return cloneJson(after);
  if (!isPlainObject(before) || !isPlainObject(after)) return cloneJson(after);

  const merged: { [key: string]: JsonValue } = cloneJson(before);
  Object.entries(after).forEach(([key, value]) => {
    merged[key] = key in merged ? mergeJsonObjects(merged[key], value) : cloneJson(value);
  });
  return sortJson(merged);
}

function mergeJsonByDiff(before: JsonValue, after: JsonValue, mode: JsonMergeMode) {
  if (mode === 'full') return mergeJsonObjects(before, after);

  const merged = cloneJson(before);
  const diffs = diffJson(before, after);

  diffs.forEach((diff) => {
    const canApplyValue =
      mode === 'diff' ||
      (mode === 'value' &&
        diff.type === 'changed' &&
        !isPlainObject(diff.before ?? null) &&
        !Array.isArray(diff.before) &&
        !isPlainObject(diff.after ?? null) &&
        !Array.isArray(diff.after));

    if (canApplyValue) {
      const nextValue = getJsonAtPath(after, diff.path);
      if (nextValue !== undefined) setJsonAtPath(merged, diff.path, cloneJson(nextValue));
    }
  });

  return sortJson(merged);
}

function normalizeLines(value: string, ignoreWhitespace: boolean) {
  return value.replace(/\r\n/g, '\n').split('\n').map((line) => (ignoreWhitespace ? line.trim() : line));
}

function diffLines(oldText: string, newText: string, ignoreWhitespace: boolean): DiffOp[] {
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

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (match) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[match];
  });
}

function decodeHtml(value: string) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
}

function toBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function fromBase64(value: string) {
  const binary = atob(value.trim());
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function parseCsv(input: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((item) => item.length > 0) || input.endsWith(delimiter)) rows.push(row);
  return rows;
}

function csvRowsToObjects(rows: string[][]) {
  const [headers = [], ...body] = rows;
  return body.map((row) =>
    headers.reduce<Record<string, string>>((record, header, index) => {
      record[header || `column_${index + 1}`] = row[index] ?? '';
      return record;
    }, {}),
  );
}

function rgbToHsl(r: number, g: number, b: number) {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case nr:
        h = (ng - nb) / d + (ng < nb ? 6 : 0);
        break;
      case ng:
        h = (nb - nr) / d + 2;
        break;
      default:
        h = (nr - ng) / d + 4;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function parseHexColor(input: string) {
  const normalized = input.trim().replace('#', '');
  const hex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;

  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const hsl = rgbToHsl(r, g, b);
  return {
    hex: `#${hex.toUpperCase()}`,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
  };
}

function collectRegexMatches(pattern: string, flags: string, sample: string) {
  try {
    const scanFlags = flags.includes('g') ? flags : `${flags}g`;
    const regex = new RegExp(pattern, scanFlags);
    const matches: RegexMatchResult[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(sample)) !== null) {
      matches.push({
        text: match[0],
        index: match.index,
        groups: match.slice(1),
      });

      if (match[0] === '') regex.lastIndex += 1;
    }

    return { error: '', matches };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Invalid regex',
      matches: [] as RegexMatchResult[],
    };
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

function ToolbarButton({
  children,
  onClick,
  title,
  variant = 'secondary',
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  return (
    <button className={`toolbar-button ${variant}`} type="button" onClick={onClick} title={title} disabled={disabled}>
      {children}
    </button>
  );
}

function Field({
  label,
  children,
  compact = false,
}: {
  label: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <label className={`field ${compact ? 'compact' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function AppShell({
  activeTool,
  setActiveTool,
  favoriteIds,
  toggleFavorite,
  query,
  setQuery,
  children,
}: {
  activeTool: ToolId;
  setActiveTool: (id: ToolId) => void;
  favoriteIds: ToolId[];
  toggleFavorite: (id: ToolId) => void;
  query: string;
  setQuery: (query: string) => void;
  children: ReactNode;
}) {
  const active = tools.find((tool) => tool.id === activeTool) ?? tools[0];
  const filteredTools = tools.filter((tool) => `${tool.name} ${tool.shortName} ${tool.group}`.toLowerCase().includes(query.toLowerCase()));
  const favorites = tools.filter((tool) => favoriteIds.includes(tool.id));
  const groupedTools = filteredTools.reduce<Record<string, typeof tools>>((groups, tool) => {
    groups[tool.group] = groups[tool.group] ? [...groups[tool.group], tool] : [tool];
    return groups;
  }, {});

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Shuffle size={20} />
          </div>
          <div>
            <h1>Tools Hub</h1>
            <p>{tools.length} tools</p>
          </div>
        </div>

        <label className="search-box">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" />
        </label>

        {favorites.length > 0 && (
          <section className="nav-section">
            <h2>Favorites</h2>
            <div className="tool-grid compact-grid">
              {favorites.map((tool) => (
                <button
                  className={`tool-chip ${activeTool === tool.id ? 'active' : ''}`}
                  key={tool.id}
                  type="button"
                  onClick={() => setActiveTool(tool.id)}
                  title={tool.name}
                >
                  {tool.icon}
                  <span>{tool.shortName}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <nav className="tool-nav">
          {Object.entries(groupedTools).map(([group, groupTools]) => (
            <section className="nav-section" key={group}>
              <h2>{group}</h2>
              {groupTools.map((tool) => (
                <button
                  className={`tool-row ${activeTool === tool.id ? 'active' : ''}`}
                  key={tool.id}
                  type="button"
                  onClick={() => setActiveTool(tool.id)}
                >
                  <span className="tool-icon">{tool.icon}</span>
                  <span>{tool.name}</span>
                  <span
                    className="favorite-toggle"
                    role="button"
                    tabIndex={0}
                    title={favoriteIds.includes(tool.id) ? 'Remove favorite' : 'Add favorite'}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite(tool.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleFavorite(tool.id);
                      }
                    }}
                  >
                    {favoriteIds.includes(tool.id) ? <Star size={15} fill="currentColor" /> : <StarOff size={15} />}
                  </span>
                </button>
              ))}
            </section>
          ))}
        </nav>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div>
            <p>{active.group}</p>
            <h2>{active.name}</h2>
          </div>
          <button className="ghost-button" type="button" onClick={() => toggleFavorite(active.id)}>
            {favoriteIds.includes(active.id) ? <Star size={17} fill="currentColor" /> : <StarOff size={17} />}
            <span>{favoriteIds.includes(active.id) ? 'Saved' : 'Save'}</span>
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}

function JsonTool() {
  const [mode, setMode] = useState<'format' | 'compare'>('compare');
  const [left, setLeft] = useState(sampleLeftJson);
  const [right, setRight] = useState(sampleRightJson);
  const [mergeMode, setMergeMode] = useState<JsonMergeMode>('diff');
  const [jsonResult, setJsonResult] = useState('');
  const [jsonError, setJsonError] = useState('');

  const compareState = useMemo(() => {
    try {
      if (!left.trim() || !right.trim()) return { diffs: [] as JsonDiff[], leftSorted: '', rightSorted: '', error: '' };
      const parsedLeft = parseJson(left);
      const parsedRight = parseJson(right);
      return {
        diffs: diffJson(sortJson(parsedLeft), sortJson(parsedRight)),
        leftSorted: formatJson(parsedLeft),
        rightSorted: formatJson(parsedRight),
        error: '',
      };
    } catch (error) {
      return {
        diffs: [] as JsonDiff[],
        leftSorted: '',
        rightSorted: '',
        error: error instanceof Error ? error.message : 'Invalid JSON',
      };
    }
  }, [left, right]);

  function runFormat(target: 'left' | 'right') {
    try {
      const parsed = parseJson(target === 'left' ? left : right);
      const formatted = formatJson(parsed);
      if (target === 'left') setLeft(formatted);
      if (target === 'right') setRight(formatted);
      setJsonResult(formatted);
      setJsonError('');
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  }

  function runMerge() {
    try {
      const parsedLeft = parseJson(left);
      const parsedRight = parseJson(right);
      setJsonResult(formatJson(mergeJsonByDiff(parsedLeft, parsedRight, mergeMode)));
      setJsonError('');
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  }

  return (
    <section className="tool-surface">
      <div className="segmented two">
        <button className={mode === 'compare' ? 'active' : ''} type="button" onClick={() => setMode('compare')}>
          Compare
        </button>
        <button className={mode === 'format' ? 'active' : ''} type="button" onClick={() => setMode('format')}>
          Format
        </button>
      </div>

      <div className="split-editor">
        <Field label="Before">
          <textarea value={left} onChange={(event) => setLeft(event.target.value)} spellCheck={false} />
        </Field>
        <Field label="After">
          <textarea value={right} onChange={(event) => setRight(event.target.value)} spellCheck={false} />
        </Field>
      </div>

      <div className="action-bar">
        {mode === 'format' && (
          <>
            <ToolbarButton title="Format before JSON" variant="primary" onClick={() => runFormat('left')}>
              <FileJson size={16} />
              <span>Left</span>
            </ToolbarButton>
            <ToolbarButton title="Format after JSON" onClick={() => runFormat('right')}>
              <FileJson size={16} />
              <span>Right</span>
            </ToolbarButton>
          </>
        )}
        {mode === 'compare' && (
          <>
            <Field label="Merge" compact>
              <select value={mergeMode} onChange={(event) => setMergeMode(event.target.value as JsonMergeMode)}>
                <option value="full">Full</option>
                <option value="diff">Differences</option>
                <option value="value">Values only</option>
              </select>
            </Field>
            <ToolbarButton title="Create merged JSON" variant="primary" onClick={runMerge}>
              <Repeat2 size={16} />
              <span>Merge</span>
            </ToolbarButton>
            <ToolbarButton title="Swap inputs" onClick={() => {
              setLeft(right);
              setRight(left);
            }}>
              <ArrowDownUp size={16} />
              <span>Swap</span>
            </ToolbarButton>
          </>
        )}
        <ToolbarButton title="Copy result" onClick={() => copyText(jsonResult)} disabled={!jsonResult}>
          <Copy size={16} />
          <span>Copy</span>
        </ToolbarButton>
      </div>

      {jsonError || compareState.error ? <div className="notice error">{jsonError || compareState.error}</div> : null}

      {mode === 'compare' && (
        <>
          <div className="metrics-row">
            <Stat label="Changed" value={compareState.diffs.filter((diff) => diff.type === 'changed').length} />
            <Stat label="Added" value={compareState.diffs.filter((diff) => diff.type === 'added').length} />
            <Stat label="Removed" value={compareState.diffs.filter((diff) => diff.type === 'removed').length} />
            <Stat label="Total" value={compareState.diffs.length} />
          </div>
          <div className="diff-list">
            {compareState.diffs.length === 0 ? (
              <div className="empty-state">No differences</div>
            ) : (
              compareState.diffs.slice(0, 80).map((diff, index) => (
                <div className={`diff-row ${diff.type}`} key={`${pathLabel(diff.path)}-${index}`}>
                  <strong>{pathLabel(diff.path)}</strong>
                  <span>{diff.type}</span>
                  <code>{compactJson(diff.before)}</code>
                  <code>{compactJson(diff.after)}</code>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {jsonResult && (
        <Field label="Result">
          <textarea className="result-output" value={jsonResult} onChange={(event) => setJsonResult(event.target.value)} spellCheck={false} />
        </Field>
      )}

      {mode === 'format' && !jsonResult && (
        <div className="split-editor compact-preview">
          <Field label="Sorted Before">
            <textarea value={compareState.leftSorted} readOnly spellCheck={false} />
          </Field>
          <Field label="Sorted After">
            <textarea value={compareState.rightSorted} readOnly spellCheck={false} />
          </Field>
        </div>
      )}
    </section>
  );
}

function TextDiffTool() {
  const [oldText, setOldText] = useState('Release note: Fixed login timeout.\nEmail title: Welcome back');
  const [newText, setNewText] = useState('Release note: Fixed session timeout.\nEmail title: Welcome back\nCTA: Continue');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const diffs = useMemo(() => diffLines(oldText, newText, ignoreWhitespace), [oldText, newText, ignoreWhitespace]);
  const added = diffs.filter((diff) => diff.type === 'added').length;
  const removed = diffs.filter((diff) => diff.type === 'removed').length;
  const changed = diffs.filter((diff) => diff.type === 'changed').length;

  return (
    <section className="tool-surface">
      <div className="split-editor">
        <Field label="Before">
          <textarea value={oldText} onChange={(event) => setOldText(event.target.value)} />
        </Field>
        <Field label="After">
          <textarea value={newText} onChange={(event) => setNewText(event.target.value)} />
        </Field>
      </div>
      <div className="action-bar">
        <label className="check-control">
          <input type="checkbox" checked={ignoreWhitespace} onChange={(event) => setIgnoreWhitespace(event.target.checked)} />
          <span>Ignore whitespace</span>
        </label>
        <ToolbarButton
          title="Copy diff"
          onClick={() =>
            copyText(
              diffs
                .map((diff) => {
                  if (diff.type === 'same') return `  ${diff.oldText ?? ''}`;
                  if (diff.type === 'added') return `+ ${diff.newText ?? ''}`;
                  if (diff.type === 'removed') return `- ${diff.oldText ?? ''}`;
                  return `- ${diff.oldText ?? ''}\n+ ${diff.newText ?? ''}`;
                })
                .join('\n'),
            )
          }
        >
          <Clipboard size={16} />
          <span>Copy</span>
        </ToolbarButton>
      </div>
      <div className="metrics-row">
        <Stat label="Changed" value={changed} />
        <Stat label="Added" value={added} />
        <Stat label="Removed" value={removed} />
        <Stat label="Lines" value={diffs.length} />
      </div>
      <div className="text-diff-view">
        {diffs.map((diff, index) => (
          <div className={`line-diff ${diff.type}`} key={`${diff.type}-${index}`}>
            <span>{diff.type === 'same' ? ' ' : diff.type === 'added' ? '+' : diff.type === 'removed' ? '-' : '~'}</span>
            {diff.type === 'changed' ? (
              <div>
                <del>{diff.oldText}</del>
                <ins>{diff.newText}</ins>
              </div>
            ) : (
              <code>{diff.oldText ?? diff.newText}</code>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function TimeTool() {
  const [value, setValue] = useState(() => String(Date.now()));
  const date = useMemo(() => {
    const trimmed = value.trim();
    if (/^\d{10}$/.test(trimmed)) return new Date(Number(trimmed) * 1000);
    if (/^\d{13}$/.test(trimmed)) return new Date(Number(trimmed));
    return new Date(trimmed);
  }, [value]);
  const valid = !Number.isNaN(date.getTime());
  const now = new Date();

  return (
    <section className="tool-surface">
      <div className="inline-controls wide">
        <Field label="Input" compact>
          <input value={value} onChange={(event) => setValue(event.target.value)} />
        </Field>
        <ToolbarButton title="Use current time" variant="primary" onClick={() => setValue(String(Date.now()))}>
          <Clock3 size={16} />
          <span>Now</span>
        </ToolbarButton>
      </div>
      <div className="metrics-row">
        <Stat label="Unix seconds" value={valid ? Math.floor(date.getTime() / 1000) : '-'} />
        <Stat label="Unix milliseconds" value={valid ? date.getTime() : '-'} />
        <Stat label="Current seconds" value={Math.floor(now.getTime() / 1000)} />
        <Stat label="Current ms" value={now.getTime()} />
      </div>
      <div className="output-grid">
        <Field label="Local">
          <input readOnly value={valid ? date.toLocaleString() : 'Invalid date'} />
        </Field>
        <Field label="ISO">
          <input readOnly value={valid ? date.toISOString() : 'Invalid date'} />
        </Field>
        <Field label="UTC">
          <input readOnly value={valid ? date.toUTCString() : 'Invalid date'} />
        </Field>
      </div>
    </section>
  );
}

function TextTool() {
  const [input, setInput] = useState('Apple\nbanana\nApple\n  carrot  ');
  const [output, setOutput] = useState('');

  const lines = input.split(/\r?\n/);
  const words = input.trim() ? input.trim().split(/\s+/).length : 0;

  function run(action: string) {
    const next =
      action === 'upper'
        ? input.toUpperCase()
        : action === 'lower'
          ? input.toLowerCase()
          : action === 'title'
            ? input.toLowerCase().replace(/\b\p{L}/gu, (char) => char.toUpperCase())
            : action === 'trim'
              ? lines.map((line) => line.trim()).join('\n')
              : action === 'sort'
                ? [...lines].sort((a, b) => a.localeCompare(b)).join('\n')
                : action === 'dedupe'
                  ? Array.from(new Set(lines)).join('\n')
                  : input;
    setOutput(next);
  }

  return (
    <section className="tool-surface">
      <div className="split-editor">
        <Field label="Input">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} />
        </Field>
        <Field label="Output">
          <textarea value={output} onChange={(event) => setOutput(event.target.value)} />
        </Field>
      </div>
      <div className="action-bar">
        {[
          ['upper', 'Upper'],
          ['lower', 'Lower'],
          ['title', 'Title'],
          ['trim', 'Trim'],
          ['sort', 'Sort'],
          ['dedupe', 'Dedupe'],
        ].map(([action, label]) => (
          <ToolbarButton key={action} title={label} onClick={() => run(action)}>
            <CaseSensitive size={16} />
            <span>{label}</span>
          </ToolbarButton>
        ))}
        <ToolbarButton title="Copy output" onClick={() => copyText(output)} disabled={!output}>
          <Copy size={16} />
          <span>Copy</span>
        </ToolbarButton>
      </div>
      <div className="metrics-row">
        <Stat label="Characters" value={input.length} />
        <Stat label="Words" value={words} />
        <Stat label="Lines" value={lines.length} />
      </div>
    </section>
  );
}

function normalizeLineEndings(value: string) {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

const cleanerActions = [
  { id: 'normalize-newlines', label: '統一換行' },
  { id: 'fullwidth-space', label: '全形空白轉半形' },
  { id: 'trim-lines', label: '移除前後空白' },
  { id: 'collapse-space', label: '移除多餘空白' },
  { id: 'remove-empty', label: '移除空行' },
  { id: 'lines-to-comma', label: '多行轉逗號' },
  { id: 'comma-to-lines', label: '逗號轉多行' },
] as const;

type CleanerActionId = (typeof cleanerActions)[number]['id'];

const defaultCleanerActions: CleanerActionId[] = [
  'normalize-newlines',
  'fullwidth-space',
  'trim-lines',
  'collapse-space',
  'remove-empty',
];

function applyCleanerAction(value: string, action: CleanerActionId) {
  const normalized = normalizeLineEndings(value);
  const lines = normalized.split('\n');

  switch (action) {
    case 'normalize-newlines':
      return normalized;
    case 'fullwidth-space':
      return normalized.replace(/\u3000/g, ' ');
    case 'trim-lines':
      return lines.map((line) => line.trim()).join('\n').trim();
    case 'collapse-space':
      return lines.map((line) => line.replace(/[ \t]+/g, ' ')).join('\n');
    case 'remove-empty':
      return lines.filter((line) => line.trim().length > 0).join('\n');
    case 'lines-to-comma':
      return lines
        .map((line) => line.trim())
        .filter(Boolean)
        .join(', ');
    case 'comma-to-lines':
      return normalized
        .split(/[，,]/)
        .map((item) => item.trim())
        .filter(Boolean)
        .join('\n');
  }
}

function TextCleanerTool() {
  const [input, setInput] = useState('  第一段文字　　有全形空白  \r\n\r\n第二段   有   多餘空白\r\n第三段,第四段  ');
  const [output, setOutput] = useState('');
  const [selectedActions, setSelectedActions] = useState<CleanerActionId[]>(defaultCleanerActions);

  const inputLines = normalizeLineEndings(input).split('\n');
  const outputLines = output ? normalizeLineEndings(output).split('\n') : [];

  function toggleCleanerAction(action: CleanerActionId) {
    setSelectedActions((current) =>
      current.includes(action) ? current.filter((item) => item !== action) : [...current, action],
    );
  }

  function clean(actions: CleanerActionId[]) {
    const selected = cleanerActions.filter((action) => actions.includes(action.id));
    const next = selected.reduce((current, action) => applyCleanerAction(current, action.id), input);
    setOutput(next);
  }

  return (
    <section className="tool-surface">
      <div className="split-editor">
        <Field label="Input">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} />
        </Field>
        <Field label="Output">
          <textarea value={output} onChange={(event) => setOutput(event.target.value)} />
        </Field>
      </div>
      <div className="cleaner-panel">
        {cleanerActions.map((action) => (
          <label className="check-control" key={action.id}>
            <input
              type="checkbox"
              checked={selectedActions.includes(action.id)}
              onChange={() => toggleCleanerAction(action.id)}
            />
            <span>{action.label}</span>
          </label>
        ))}
      </div>
      <div className="action-bar cleaner-actions">
        <ToolbarButton title="Run selected cleaners" variant="primary" onClick={() => clean(selectedActions)} disabled={selectedActions.length === 0}>
          <Eraser size={16} />
          <span>執行勾選</span>
        </ToolbarButton>
        <ToolbarButton title="Select default cleaners" onClick={() => setSelectedActions(defaultCleanerActions)}>
          <Check size={16} />
          <span>預設</span>
        </ToolbarButton>
        <ToolbarButton title="Clear selected cleaners" onClick={() => setSelectedActions([])}>
          <Eraser size={16} />
          <span>清除規則</span>
        </ToolbarButton>
        <ToolbarButton title="Apply output to input" variant="primary" onClick={() => setInput(output)} disabled={!output}>
          <Repeat2 size={16} />
          <span>套用</span>
        </ToolbarButton>
        <ToolbarButton title="Copy output" onClick={() => copyText(output)} disabled={!output}>
          <Copy size={16} />
          <span>Copy</span>
        </ToolbarButton>
      </div>
      <div className="metrics-row">
        <Stat label="Input chars" value={input.length} />
        <Stat label="Input lines" value={inputLines.length} />
        <Stat label="Output chars" value={output.length || '-'} />
        <Stat label="Output lines" value={output ? outputLines.length : '-'} />
      </div>
    </section>
  );
}

function ImageTool() {
  const [fileName, setFileName] = useState('');
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1600);
  const [preview, setPreview] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [stats, setStats] = useState({ original: 0, compressed: 0, width: 0, height: 0 });
  const [status, setStatus] = useState('');

  async function compressImage(file: File) {
    setFileName(file.name);
    setStatus('Processing');
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });

    const ratio = Math.min(1, maxWidth / image.width);
    const width = Math.round(image.width * ratio);
    const height = Math.round(image.height * ratio);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(image, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) return;

    if (resultUrl) URL.revokeObjectURL(resultUrl);
    const nextUrl = URL.createObjectURL(blob);
    setPreview(dataUrl);
    setResultUrl(nextUrl);
    setStats({ original: file.size, compressed: blob.size, width, height });
    setStatus('Ready');
  }

  return (
    <section className="tool-surface">
      <div className="inline-controls wide">
        <Field label="Image" compact>
          <input
            type="file"
            accept="image/*"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const file = event.target.files?.[0];
              if (file) void compressImage(file);
            }}
          />
        </Field>
        <Field label="Quality" compact>
          <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
        </Field>
        <Field label="Max width" compact>
          <input type="number" min="100" value={maxWidth} onChange={(event) => setMaxWidth(Number(event.target.value))} />
        </Field>
        <ToolbarButton
          title="Download image"
          variant="primary"
          disabled={!resultUrl}
          onClick={() => {
            if (resultUrl) {
              fetch(resultUrl)
                .then((response) => response.blob())
                .then((blob) => downloadBlob(blob, `${fileName.replace(/\.[^.]+$/, '') || 'image'}-compressed.jpg`));
            }
          }}
        >
          <Download size={16} />
          <span>Download</span>
        </ToolbarButton>
      </div>
      <div className="metrics-row">
        <Stat label="Status" value={status || '-'} />
        <Stat label="Original" value={stats.original ? `${Math.round(stats.original / 1024)} KB` : '-'} />
        <Stat label="Compressed" value={stats.compressed ? `${Math.round(stats.compressed / 1024)} KB` : '-'} />
        <Stat label="Size" value={stats.width ? `${stats.width} x ${stats.height}` : '-'} />
      </div>
      <div className="image-preview-grid">
        <div>{preview ? <img src={preview} alt="Original preview" /> : <div className="empty-state">Original</div>}</div>
        <div>{resultUrl ? <img src={resultUrl} alt="Compressed preview" /> : <div className="empty-state">Compressed</div>}</div>
      </div>
    </section>
  );
}

function ColorTool() {
  const [value, setValue] = useState('#2F6F73');
  const color = parseHexColor(value);

  return (
    <section className="tool-surface">
      <div className="inline-controls wide">
        <Field label="HEX" compact>
          <input value={value} onChange={(event) => setValue(event.target.value)} />
        </Field>
        <input className="color-picker" type="color" value={color?.hex ?? '#000000'} onChange={(event) => setValue(event.target.value)} title="Pick color" />
      </div>
      <div className="color-panel">
        <div className="swatch" style={{ background: color?.hex ?? '#f2f4f6' }} />
        <div className="output-grid">
          <Field label="HEX">
            <input readOnly value={color?.hex ?? 'Invalid color'} />
          </Field>
          <Field label="RGB">
            <input readOnly value={color?.rgb ?? 'Invalid color'} />
          </Field>
          <Field label="HSL">
            <input readOnly value={color?.hsl ?? 'Invalid color'} />
          </Field>
        </div>
      </div>
    </section>
  );
}

function RegexTool() {
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b');
  const [flags, setFlags] = useState('gi');
  const [sample, setSample] = useState('dev@example.com\nsales@example.com\nnot-an-email');

  const result = useMemo(() => {
    return collectRegexMatches(pattern, flags, sample);
  }, [flags, pattern, sample]);

  const highlightedSample = useMemo<HighlightSegment[]>(() => {
    if (result.error || result.matches.length === 0) return [{ type: 'text', text: sample }];

    const segments: HighlightSegment[] = [];
    let cursor = 0;

    result.matches.forEach((match, index) => {
      if (match.text.length === 0) return;
      if (match.index > cursor) {
        segments.push({ type: 'text', text: sample.slice(cursor, match.index) });
      }
      segments.push({ type: 'match', text: match.text, index });
      cursor = match.index + match.text.length;
    });

    if (cursor < sample.length) {
      segments.push({ type: 'text', text: sample.slice(cursor) });
    }

    return segments.length > 0 ? segments : [{ type: 'text', text: sample }];
  }, [result.error, result.matches, sample]);

  return (
    <section className="tool-surface">
      <div className="inline-controls wide">
        <Field label="Pattern" compact>
          <input value={pattern} onChange={(event) => setPattern(event.target.value)} />
        </Field>
        <Field label="Flags" compact>
          <input value={flags} onChange={(event) => setFlags(event.target.value)} />
        </Field>
      </div>
      <Field label="Test text">
        <textarea value={sample} onChange={(event) => setSample(event.target.value)} />
      </Field>
      {result.error ? <div className="notice error">{result.error}</div> : null}
      <div className="metrics-row">
        <Stat label="Matches" value={result.matches.length} />
        <Stat label="Flags" value={flags || '-'} />
      </div>
      <div className="regex-preview" aria-label="Highlighted regex matches">
        {highlightedSample.map((segment, index) =>
          segment.type === 'match' ? (
            <mark key={`${segment.type}-${segment.index}-${index}`}>{segment.text}</mark>
          ) : (
            <span key={`${segment.type}-${index}`}>{segment.text}</span>
          ),
        )}
      </div>
      <div className="match-list">
        {result.matches.map((match, index) => (
          <div className="match-row" key={`${match.index}-${index}`}>
            <strong>#{index + 1}</strong>
            <code>{match.text}</code>
            <span>@ {match.index}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function EncodeTool() {
  const [input, setInput] = useState('hello 世界');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  function run(action: string) {
    try {
      const next =
        action === 'url-encode'
          ? encodeURIComponent(input)
          : action === 'url-decode'
            ? decodeURIComponent(input)
            : action === 'b64-encode'
              ? toBase64(input)
              : action === 'b64-decode'
                ? fromBase64(input)
                : action === 'html-encode'
                  ? escapeHtml(input)
                  : action === 'html-decode'
                    ? decodeHtml(input)
                    : action === 'jwt'
                      ? JSON.stringify(JSON.parse(fromBase64(input.split('.')[1] ?? '')), null, 2)
                      : input;
      setOutput(next);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to decode');
    }
  }

  return (
    <section className="tool-surface">
      <div className="split-editor">
        <Field label="Input">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} />
        </Field>
        <Field label="Output">
          <textarea value={output} onChange={(event) => setOutput(event.target.value)} />
        </Field>
      </div>
      <div className="action-bar">
        {[
          ['url-encode', 'URL +'],
          ['url-decode', 'URL -'],
          ['b64-encode', 'Base64 +'],
          ['b64-decode', 'Base64 -'],
          ['html-encode', 'HTML +'],
          ['html-decode', 'HTML -'],
          ['jwt', 'JWT'],
        ].map(([action, label]) => (
          <ToolbarButton key={action} title={label} onClick={() => run(action)}>
            <Code2 size={16} />
            <span>{label}</span>
          </ToolbarButton>
        ))}
        <ToolbarButton title="Copy output" onClick={() => copyText(output)} disabled={!output}>
          <Copy size={16} />
          <span>Copy</span>
        </ToolbarButton>
      </div>
      {error ? <div className="notice error">{error}</div> : null}
    </section>
  );
}

function CsvTool() {
  const [input, setInput] = useState('key,zhTW,enUS\nsave,儲存,Save\ncancel,取消,Cancel');
  const [delimiter, setDelimiter] = useState(',');
  const rows = useMemo(() => parseCsv(input, delimiter === '\\t' ? '\t' : delimiter), [delimiter, input]);
  const json = useMemo(() => JSON.stringify(csvRowsToObjects(rows), null, 2), [rows]);

  return (
    <section className="tool-surface">
      <div className="inline-controls">
        <Field label="Delimiter" compact>
          <select value={delimiter} onChange={(event) => setDelimiter(event.target.value)}>
            <option value=",">Comma</option>
            <option value="\t">Tab</option>
            <option value=";">Semicolon</option>
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

export function App() {
  const [activeTool, setActiveToolState] = useState<ToolId>(() => readStoredToolId('tools-hub.active', 'json'));
  const [favoriteIds, setFavoriteIds] = useState<ToolId[]>(() => readStoredToolList('tools-hub.favorites', starterFavorites));
  const [query, setQuery] = useState('');

  function setActiveTool(id: ToolId) {
    setActiveToolState(id);
    writeStorage('tools-hub.active', id);
  }

  function toggleFavorite(id: ToolId) {
    setFavoriteIds((current) => {
      const next = current.includes(id) ? current.filter((toolId) => toolId !== id) : [...current, id];
      writeStorage('tools-hub.favorites', next);
      return next;
    });
  }

  const content = {
    json: <JsonTool />,
    'text-diff': <TextDiffTool />,
    'text-cleaner': <TextCleanerTool />,
    time: <TimeTool />,
    text: <TextTool />,
    image: <ImageTool />,
    color: <ColorTool />,
    regex: <RegexTool />,
    encode: <EncodeTool />,
    csv: <CsvTool />,
  }[activeTool];

  return (
    <AppShell
      activeTool={activeTool}
      setActiveTool={setActiveTool}
      favoriteIds={favoriteIds}
      toggleFavorite={toggleFavorite}
      query={query}
      setQuery={setQuery}
    >
      {content}
    </AppShell>
  );
}
