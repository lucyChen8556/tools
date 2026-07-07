import { useMemo, useState } from 'react';
import { ArrowDownUp, FileJson, Repeat2 } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { SelectField } from '../components/SelectField';
import { TextAreaField } from '../components/TextAreaField';
import { ActionBar, MetricsGrid, SplitTextAreas } from '../components/ToolLayout';
import { ToolbarButton } from '../components/ToolbarButton';
import { jsonMergeModeOptions } from '../config/options';
import type { JsonDiff, JsonMergeMode } from '../types';
import { compactJson, diffJson, formatJson, mergeJsonByDiff, parseJson, pathLabel, sortJson } from './json/jsonUtils';

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

const jsonModeOptions = [
  { label: 'Compare', value: 'compare' },
  { label: 'Format', value: 'format' },
] as const;

const formatTargetOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
] as const;

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
      <SegmentedTabs ariaLabel="JSON mode" options={jsonModeOptions} value={mode} onChange={setMode} />

      <SplitTextAreas
        left={{ label: 'Before', value: left, onChange: setLeft, spellCheck: false }}
        right={{ label: 'After', value: right, onChange: setRight, spellCheck: false }}
      />

      <ActionBar>
        {mode === 'format' && (
          <>
            <SegmentedTabs compact ariaLabel="Format target" options={formatTargetOptions} value={formatTarget} onChange={setFormatTarget} />
            <ToolbarButton title="Format selected JSON" variant="primary" onClick={() => runFormat(formatTarget)}>
              <FileJson size={16} />
              <span>Format</span>
            </ToolbarButton>
          </>
        )}
        {mode === 'compare' && (
          <>
            <SelectField label="Merge" value={mergeMode} options={jsonMergeModeOptions} onChange={setMergeMode} />
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
        <CopyButton title="Copy result" value={jsonResult} />
      </ActionBar>

      {jsonError || compareState.error ? <div className="notice error">{jsonError || compareState.error}</div> : null}

      {mode === 'compare' && (
        <>
          <MetricsGrid
            items={[
              { label: 'Changed', value: compareState.diffs.filter((diff) => diff.type === 'changed').length },
              { label: 'Added', value: compareState.diffs.filter((diff) => diff.type === 'added').length },
              { label: 'Removed', value: compareState.diffs.filter((diff) => diff.type === 'removed').length },
              { label: 'Total', value: compareState.diffs.length },
            ]}
          />
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
        <TextAreaField label="Result" value={jsonResult} onChange={setJsonResult} spellCheck={false} className="result-output" />
      )}

      {mode === 'format' && !jsonResult && (
        <SplitTextAreas
          compact
          left={{ label: 'Sorted Before', value: compareState.leftSorted, readOnly: true, spellCheck: false }}
          right={{ label: 'Sorted After', value: compareState.rightSorted, readOnly: true, spellCheck: false }}
        />
      )}
    </section>
  );
}
export { JsonTool };
