import { useMemo, useState } from 'react';
import { CaseSensitive } from 'lucide-react';
import { ApplyTextButton } from '../components/ApplyTextButton';
import { CheckboxControl } from '../components/CheckboxControl';
import { CopyButton } from '../components/CopyButton';
import { SelectField } from '../components/SelectField';
import { ActionBar, MetricsGrid, SplitTextAreas } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolbarButton } from '../components/ToolbarButton';
import { textCaseOptions, type TextCaseMode } from '../config/options';
import { countDuplicateLines, runTextTransforms, textProcessorDefaults, textTransforms, type TextTransformId } from './textProcessor/textProcessorUtils';

function TextTool() {
  const [input, setInput] = useState(textProcessorDefaults.input);
  const [output, setOutput] = useState(textProcessorDefaults.output);
  const [caseMode, setCaseMode] = useState<TextCaseMode>(textProcessorDefaults.caseMode);
  const [selectedTransforms, setSelectedTransforms] = useState<TextTransformId[]>(textProcessorDefaults.selectedTransforms);
  const [dedupeIgnoreCase, setDedupeIgnoreCase] = useState(textProcessorDefaults.dedupeIgnoreCase);
  const [dedupeTrimKey, setDedupeTrimKey] = useState(textProcessorDefaults.dedupeTrimKey);

  const lines = input.split(/\r?\n/);
  const words = input.trim() ? input.trim().split(/\s+/).length : 0;
  const duplicateCount = countDuplicateLines(lines, { ignoreCase: dedupeIgnoreCase, trimKey: dedupeTrimKey });
  const metricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Characters', value: input.length },
      { label: 'Words', value: words },
      { label: 'Lines', value: lines.length },
      { label: 'Duplicates', value: Math.max(0, duplicateCount) },
    ],
    [duplicateCount, input.length, lines.length, words],
  );

  function toggleTransform(transform: TextTransformId) {
    setSelectedTransforms((current) =>
      current.includes(transform) ? current.filter((item) => item !== transform) : [...current, transform],
    );
  }

  function run() {
    setOutput(runTextTransforms(input, { caseMode, dedupeIgnoreCase, dedupeTrimKey, selectedTransforms }));
  }

  return (
    <section className="tool-surface">
      <SplitTextAreas left={{ label: 'Input', value: input, onChange: setInput }} right={{ label: 'Output', value: output, onChange: setOutput }} />
      <div className="inline-controls">
        <SelectField label="Case" value={caseMode} options={textCaseOptions} onChange={setCaseMode} />
      </div>
      <div className="cleaner-panel">
        {textTransforms.map((transform) => (
          <CheckboxControl
            key={transform.id}
            label={transform.label}
            checked={selectedTransforms.includes(transform.id)}
            onChange={() => toggleTransform(transform.id)}
          />
        ))}
        <CheckboxControl label="Dedupe ignores case" checked={dedupeIgnoreCase} onChange={setDedupeIgnoreCase} />
        <CheckboxControl label="Dedupe trims key" checked={dedupeTrimKey} onChange={setDedupeTrimKey} />
      </div>
      <ActionBar>
        <ToolbarButton title="Run selected transforms" variant="primary" onClick={run}>
          <CaseSensitive size={16} />
          <span>Run selected</span>
        </ToolbarButton>
        <ApplyTextButton value={output} onApply={setInput} />
        <CopyButton title="Copy output" value={output} />
      </ActionBar>
      <MetricsGrid items={metricsItems} />
    </section>
  );
}
export { TextTool };
