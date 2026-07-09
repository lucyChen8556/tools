import { useCallback, useMemo, useState } from 'react';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { SplitTextAreas } from '@/components/ToolLayout';
import type { JsonDiff, JsonMergeMode } from '@/types';
import { JsonCompareSection } from './json/components/JsonCompareSection';
import { JsonFormatSection } from './json/components/JsonFormatSection';
import { jsonModeOptions, sampleLeftJson, sampleRightJson, type JsonFormatTarget, type JsonToolMode } from './json/constants';
import { diffJson, formatJson, mergeJsonByDiff, parseJson, sortJson } from './json/jsonUtils';

function JsonTool() {
  const [mode, setMode] = useState<JsonToolMode>('compare');
  const [formatTarget, setFormatTarget] = useState<JsonFormatTarget>('left');
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

  const runFormat = useCallback((target: JsonFormatTarget) => {
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
  }, [left, right]);

  const runMerge = useCallback(() => {
    try {
      const parsedLeft = parseJson(left);
      const parsedRight = parseJson(right);
      setJsonResult(formatJson(mergeJsonByDiff(parsedLeft, parsedRight, mergeMode)));
      setJsonError('');
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
    }
  }, [left, mergeMode, right]);

  const swapInputs = useCallback(() => {
    setLeft(right);
    setRight(left);
  }, [left, right]);

  const modeContent = useMemo(
    () => ({
      compare: (
        <JsonCompareSection
          compareState={compareState}
          jsonResult={jsonResult}
          mergeMode={mergeMode}
          onJsonResultChange={setJsonResult}
          onMerge={runMerge}
          onMergeModeChange={setMergeMode}
          onSwap={swapInputs}
        />
      ),
      format: (
        <JsonFormatSection
          compareState={compareState}
          formatTarget={formatTarget}
          jsonResult={jsonResult}
          onFormat={runFormat}
          onFormatTargetChange={setFormatTarget}
          onJsonResultChange={setJsonResult}
        />
      ),
    }),
    [compareState, formatTarget, jsonResult, runFormat, runMerge, swapInputs, mergeMode],
  );

  return (
    <section className="tool-surface">
      <SegmentedTabs ariaLabel="JSON mode" options={jsonModeOptions} value={mode} onChange={setMode} />

      <SplitTextAreas
        left={{ label: 'Before', value: left, onChange: setLeft, spellCheck: false }}
        right={{ label: 'After', value: right, onChange: setRight, spellCheck: false }}
      />

      {jsonError || compareState.error ? <div className="notice error">{jsonError || compareState.error}</div> : null}
      {modeContent[mode]}
    </section>
  );
}
export { JsonTool };
