import { useMemo, useState } from 'react';
import { ArrowDownUp, Copy, FileJson, Repeat2 } from 'lucide-react';
import { Field } from '../components/Field';
import { Stat } from '../components/Stat';
import { ToolbarButton } from '../components/ToolbarButton';
import type { JsonDiff, JsonMergeMode } from '../types';
import { copyText } from '../utils/clipboard';
import { compactJson, diffJson, formatJson, mergeJsonByDiff, parseJson, pathLabel, sortJson } from '../utils/json';

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

function JsonTool() {
  const [mode, setMode] = useState<'format' | 'compare'>('compare');
  const [formatTarget, setFormatTarget] = useState<'left' | 'right'>('left');
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
            <div className="segmented two">
              <button className={formatTarget === 'left' ? 'active' : ''} type="button" onClick={() => setFormatTarget('left')}>
                Left
              </button>
              <button className={formatTarget === 'right' ? 'active' : ''} type="button" onClick={() => setFormatTarget('right')}>
                Right
              </button>
            </div>
            <ToolbarButton title="Format selected JSON" variant="primary" onClick={() => runFormat(formatTarget)}>
              <FileJson size={16} />
              <span>Format</span>
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
export { JsonTool };
