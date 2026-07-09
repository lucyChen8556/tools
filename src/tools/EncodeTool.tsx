import { useState } from 'react';
import { Code2 } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { ActionBar, SplitTextAreas } from '../components/ToolLayout';
import { ToolbarButton } from '../components/ToolbarButton';
import { decodeHtml, encodeDefaults, escapeHtml, fromBase64, toBase64 } from './encode/codecUtils';

const codecActions = [
  { id: 'url-encode', label: 'URL +', transform: encodeURIComponent },
  { id: 'url-decode', label: 'URL -', transform: decodeURIComponent },
  { id: 'b64-encode', label: 'Base64 +', transform: toBase64 },
  { id: 'b64-decode', label: 'Base64 -', transform: fromBase64 },
  { id: 'html-encode', label: 'HTML +', transform: escapeHtml },
  { id: 'html-decode', label: 'HTML -', transform: decodeHtml },
] as const;

function EncodeTool() {
  const [input, setInput] = useState(encodeDefaults.input);
  const [output, setOutput] = useState(encodeDefaults.output);
  const [error, setError] = useState(encodeDefaults.error);

  function run(transform: (value: string) => string) {
    try {
      setOutput(transform(input));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to decode');
    }
  }

  return (
    <section className="tool-surface">
      <SplitTextAreas left={{ label: 'Input', value: input, onChange: setInput }} right={{ label: 'Output', value: output, onChange: setOutput }} />
      <ActionBar>
        {codecActions.map((action) => (
          <ToolbarButton key={action.id} title={action.label} icon={<Code2 size={16} />} label={action.label} onClick={() => run(action.transform)} />
        ))}
        <CopyButton title="Copy output" value={output} />
      </ActionBar>
      {error ? <div className="notice error">{error}</div> : null}
    </section>
  );
}
export { EncodeTool };
