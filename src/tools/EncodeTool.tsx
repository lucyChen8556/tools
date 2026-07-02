import { useState } from 'react';
import { Code2 } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { TextAreaField } from '../components/TextAreaField';
import { ToolbarButton } from '../components/ToolbarButton';
import { decodeHtml, escapeHtml, fromBase64, toBase64 } from '../utils/codec';

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
        <TextAreaField label="Input" value={input} onChange={setInput} />
        <TextAreaField label="Output" value={output} onChange={setOutput} />
      </div>
      <div className="action-bar">
        {[
          ['url-encode', 'URL +'],
          ['url-decode', 'URL -'],
          ['b64-encode', 'Base64 +'],
          ['b64-decode', 'Base64 -'],
          ['html-encode', 'HTML +'],
          ['html-decode', 'HTML -'],
        ].map(([action, label]) => (
          <ToolbarButton key={action} title={label} onClick={() => run(action)}>
            <Code2 size={16} />
            <span>{label}</span>
          </ToolbarButton>
        ))}
        <CopyButton title="Copy output" value={output} />
      </div>
      {error ? <div className="notice error">{error}</div> : null}
    </section>
  );
}
export { EncodeTool };
