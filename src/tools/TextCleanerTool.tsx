import { useState } from 'react';
import { Check, Copy, Eraser, Repeat2 } from 'lucide-react';
import { Field } from '../components/Field';
import { Stat } from '../components/Stat';
import { ToolbarButton } from '../components/ToolbarButton';
import { copyText } from '../utils/clipboard';

function normalizeLineEndings(value: string) {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

const cleanerActions = [
  { id: 'normalize-newlines', label: '統一換行' },
  { id: 'fullwidth-space', label: '全形空白轉半形' },
  { id: 'trim-lines', label: '移除前後空白' },
  { id: 'collapse-space', label: '移除多餘空白' },
  { id: 'remove-empty', label: '移除空行' },
  { id: 'one-line', label: '壓縮成一行' },
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
    case 'one-line':
      return lines
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' ');
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
export { TextCleanerTool };
