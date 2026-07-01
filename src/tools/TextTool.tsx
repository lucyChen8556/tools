import { useState } from 'react';
import { CaseSensitive, Copy, Repeat2 } from 'lucide-react';
import { Field } from '../components/Field';
import { Stat } from '../components/Stat';
import { ToolbarButton } from '../components/ToolbarButton';
import { textCaseOptions, type TextCaseMode } from '../config/options';
import { copyText } from '../utils/clipboard';

type TextTransformId = 'trim' | 'sort' | 'dedupe';

const textTransforms: Array<{ id: TextTransformId; label: string }> = [
  { id: 'trim', label: 'Trim lines' },
  { id: 'sort', label: 'Sort lines' },
  { id: 'dedupe', label: 'Dedupe lines' },
];

function TextTool() {
  const [input, setInput] = useState('Apple\nbanana\nApple\n  carrot  ');
  const [output, setOutput] = useState('');
  const [caseMode, setCaseMode] = useState<TextCaseMode>('none');
  const [selectedTransforms, setSelectedTransforms] = useState<TextTransformId[]>(['trim']);

  const lines = input.split(/\r?\n/);
  const words = input.trim() ? input.trim().split(/\s+/).length : 0;

  function toggleTransform(transform: TextTransformId) {
    setSelectedTransforms((current) =>
      current.includes(transform) ? current.filter((item) => item !== transform) : [...current, transform],
    );
  }

  function applyCase(value: string) {
    if (caseMode === 'upper') return value.toUpperCase();
    if (caseMode === 'lower') return value.toLowerCase();
    if (caseMode === 'title') return value.toLowerCase().replace(/\b\p{L}/gu, (char) => char.toUpperCase());
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
        next = Array.from(new Set(nextLines)).join('\n');
      }
    });

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
      <div className="inline-controls">
        <Field label="Case" compact>
          <select value={caseMode} onChange={(event) => setCaseMode(event.target.value as TextCaseMode)}>
            {textCaseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="cleaner-panel">
        {textTransforms.map((transform) => (
          <label className="check-control" key={transform.id}>
            <input
              type="checkbox"
              checked={selectedTransforms.includes(transform.id)}
              onChange={() => toggleTransform(transform.id)}
            />
            <span>{transform.label}</span>
          </label>
        ))}
      </div>
      <div className="action-bar">
        <ToolbarButton title="Run selected transforms" variant="primary" onClick={run}>
          <CaseSensitive size={16} />
          <span>Run selected</span>
        </ToolbarButton>
        <ToolbarButton title="Apply output to input" onClick={() => setInput(output)} disabled={!output}>
          <Repeat2 size={16} />
          <span>Apply</span>
        </ToolbarButton>
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
export { TextTool };
