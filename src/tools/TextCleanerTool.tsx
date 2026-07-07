import { useState } from 'react';
import { Check, Eraser } from 'lucide-react';
import { ApplyTextButton } from '../components/ApplyTextButton';
import { CheckboxControl } from '../components/CheckboxControl';
import { CopyButton } from '../components/CopyButton';
import { ActionBar, MetricsGrid, SplitTextAreas } from '../components/ToolLayout';
import { ToolbarButton } from '../components/ToolbarButton';
import { cleanerActions, cleanText, defaultCleanerActions, normalizeLineEndings, textCleanerSample, type CleanerActionId } from './textCleaner/textCleanerUtils';

function TextCleanerTool() {
  const [input, setInput] = useState(textCleanerSample);
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
    setOutput(cleanText(input, actions));
  }

  return (
    <section className="tool-surface">
      <SplitTextAreas left={{ label: 'Input', value: input, onChange: setInput }} right={{ label: 'Output', value: output, onChange: setOutput }} />
      <div className="cleaner-panel">
        {cleanerActions.map((action) => (
          <CheckboxControl
            key={action.id}
            label={action.label}
            checked={selectedActions.includes(action.id)}
            onChange={() => toggleCleanerAction(action.id)}
          />
        ))}
      </div>
      <ActionBar className="cleaner-actions">
        <ToolbarButton title="Run selected cleaners" variant="primary" onClick={() => clean(selectedActions)} disabled={selectedActions.length === 0}>
          <Eraser size={16} />
          <span>Run selected</span>
        </ToolbarButton>
        <ToolbarButton title="Select default cleaners" onClick={() => setSelectedActions(defaultCleanerActions)}>
          <Check size={16} />
          <span>Defaults</span>
        </ToolbarButton>
        <ToolbarButton title="Clear selected cleaners" onClick={() => setSelectedActions([])}>
          <Eraser size={16} />
          <span>Clear rules</span>
        </ToolbarButton>
        <ApplyTextButton value={output} onApply={setInput} label="Apply output" variant="primary" />
        <CopyButton title="Copy output" value={output} />
      </ActionBar>
      <MetricsGrid
        items={[
          { label: 'Input chars', value: input.length },
          { label: 'Input lines', value: inputLines.length },
          { label: 'Output chars', value: output.length || '-' },
          { label: 'Output lines', value: output ? outputLines.length : '-' },
        ]}
      />
    </section>
  );
}
export { TextCleanerTool };
