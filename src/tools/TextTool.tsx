import { useState } from 'react';
import { CaseSensitive } from 'lucide-react';
import { ApplyTextButton } from '../components/ApplyTextButton';
import { CheckboxControl } from '../components/CheckboxControl';
import { CopyButton } from '../components/CopyButton';
import { SelectField } from '../components/SelectField';
import { ActionBar, MetricsGrid, SplitTextAreas } from '../components/ToolLayout';
import { ToolbarButton } from '../components/ToolbarButton';
import { textCaseOptions, type TextCaseMode } from '../config/options';

type TextTransformId = 'trim' | 'sort' | 'dedupe';

const textTransforms: Array<{ id: TextTransformId; label: string }> = [
  { id: 'trim', label: 'Trim lines' },
  { id: 'sort', label: 'Sort lines' },
  { id: 'dedupe', label: 'Dedupe lines' },
];

function splitWords(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .match(/[\p{L}\p{N}]+/gu) ?? [];
}

function capitalizeWord(value: string) {
  return value ? `${value[0].toUpperCase()}${value.slice(1).toLowerCase()}` : '';
}

function formatWords(value: string, mode: TextCaseMode) {
  const words = splitWords(value);
  if (words.length === 0) return '';

  if (mode === 'slug') return words.map((word) => word.toLowerCase()).join('-');
  if (mode === 'snake') return words.map((word) => word.toLowerCase()).join('_');
  if (mode === 'camel') {
    const [firstWord, ...restWords] = words;
    return `${(firstWord ?? '').toLowerCase()}${restWords.map(capitalizeWord).join('')}`;
  }
  if (mode === 'pascal') return words.map(capitalizeWord).join('');
  if (mode === 'constant') return words.map((word) => word.toUpperCase()).join('_');
  return value;
}

function getDedupeKey(value: string, options: { ignoreCase: boolean; trimKey: boolean }) {
  const trimmed = options.trimKey ? value.trim() : value;
  return options.ignoreCase ? trimmed.toLocaleLowerCase() : trimmed;
}

function TextTool() {
  const [input, setInput] = useState('Apple\nbanana\nApple\n  carrot  ');
  const [output, setOutput] = useState('');
  const [caseMode, setCaseMode] = useState<TextCaseMode>('none');
  const [selectedTransforms, setSelectedTransforms] = useState<TextTransformId[]>(['trim']);
  const [dedupeIgnoreCase, setDedupeIgnoreCase] = useState(false);
  const [dedupeTrimKey, setDedupeTrimKey] = useState(true);

  const lines = input.split(/\r?\n/);
  const words = input.trim() ? input.trim().split(/\s+/).length : 0;
  const duplicateCount = lines.length - new Set(lines.map((line) => getDedupeKey(line, { ignoreCase: dedupeIgnoreCase, trimKey: dedupeTrimKey }))).size;

  function toggleTransform(transform: TextTransformId) {
    setSelectedTransforms((current) =>
      current.includes(transform) ? current.filter((item) => item !== transform) : [...current, transform],
    );
  }

  function applyCase(value: string) {
    if (caseMode === 'upper') return value.toUpperCase();
    if (caseMode === 'lower') return value.toLowerCase();
    if (caseMode === 'title') return value.toLowerCase().replace(/\b\p{L}/gu, (char) => char.toUpperCase());
    if (['slug', 'snake', 'camel', 'pascal', 'constant'].includes(caseMode)) {
      return value
        .split(/\r?\n/)
        .map((line) => formatWords(line, caseMode))
        .join('\n');
    }
    return value;
  }

  function run() {
    let next = applyCase(input);

    textTransforms.forEach((transform) => {
      if (!selectedTransforms.includes(transform.id)) return;

      const nextLines = next.split(/\r?\n/);
      if (transform.id === 'trim') {
        next = nextLines.map((line) => line.trim()).join('\n');
      }
      if (transform.id === 'sort') {
        next = [...nextLines].sort((a, b) => a.localeCompare(b)).join('\n');
      }
      if (transform.id === 'dedupe') {
        const seen = new Set<string>();
        next = nextLines
          .filter((line) => {
            const key = getDedupeKey(line, { ignoreCase: dedupeIgnoreCase, trimKey: dedupeTrimKey });
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .join('\n');
      }
    });

    setOutput(next);
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
      <MetricsGrid
        items={[
          { label: 'Characters', value: input.length },
          { label: 'Words', value: words },
          { label: 'Lines', value: lines.length },
          { label: 'Duplicates', value: Math.max(0, duplicateCount) },
        ]}
      />
    </section>
  );
}
export { TextTool };
