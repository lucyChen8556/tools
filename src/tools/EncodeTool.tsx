import { useState } from 'react';
import { Code2, Copy } from 'lucide-react';
import { Field } from '../components/Field';
import { ToolbarButton } from '../components/ToolbarButton';
import { copyText } from '../utils/clipboard';
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
                    : action === 'jwt'
                      ? JSON.stringify(JSON.parse(fromBase64(input.split('.')[1] ?? '')), null, 2)
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
        <Field label="Input">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} />
        </Field>
        <Field label="Output">
          <textarea value={output} onChange={(event) => setOutput(event.target.value)} />
        </Field>
      </div>
      <div className="action-bar">
        {[
          ['url-encode', 'URL +'],
          ['url-decode', 'URL -'],
          ['b64-encode', 'Base64 +'],
          ['b64-decode', 'Base64 -'],
          ['html-encode', 'HTML +'],
          ['html-decode', 'HTML -'],
          ['jwt', 'JWT'],
        ].map(([action, label]) => (
          <ToolbarButton key={action} title={label} onClick={() => run(action)}>
            <Code2 size={16} />
            <span>{label}</span>
          </ToolbarButton>
        ))}
        <ToolbarButton title="Copy output" onClick={() => copyText(output)} disabled={!output}>
          <Copy size={16} />
          <span>Copy</span>
        </ToolbarButton>
      </div>
      {error ? <div className="notice error">{error}</div> : null}
    </section>
  );
}
export { EncodeTool };
