import { useEffect, useState } from 'react';
import { Copy, Fingerprint } from 'lucide-react';
import { CopyableRows } from '../components/CopyableRows';
import { Field } from '../components/Field';
import { Stat } from '../components/Stat';
import { ToolbarButton } from '../components/ToolbarButton';
import { copyText } from '../utils/clipboard';

const hashAlgorithms = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;

type HashResult = {
  algorithm: (typeof hashAlgorithms)[number];
  value: string;
};

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function HashTool() {
  const [input, setInput] = useState('hello world');
  const [results, setResults] = useState<HashResult[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function buildHashes() {
      try {
        const payload = new TextEncoder().encode(input);
        const nextResults = await Promise.all(
          hashAlgorithms.map(async (algorithm) => ({
            algorithm,
            value: toHex(await crypto.subtle.digest(algorithm, payload)),
          })),
        );
        if (!cancelled) {
          setResults(nextResults);
          setError('');
        }
      } catch (buildError) {
        if (!cancelled) {
          setResults([]);
          setError(buildError instanceof Error ? buildError.message : 'Unable to generate hashes');
        }
      }
    }

    buildHashes();
    return () => {
      cancelled = true;
    };
  }, [input]);

  return (
    <section className="tool-surface">
      <Field label="Input">
        <textarea value={input} onChange={(event) => setInput(event.target.value)} />
      </Field>
      {error ? <div className="notice error">{error}</div> : null}
      <div className="metrics-row">
        <Stat label="Characters" value={input.length} />
        <Stat label="Bytes" value={new TextEncoder().encode(input).length} />
        <Stat label="Algorithms" value={hashAlgorithms.length} />
        <Stat label="Output format" value="Hex" />
      </div>
      <CopyableRows rows={results.map((result) => ({ label: result.algorithm, value: result.value }))} />
      <div className="action-bar">
        <ToolbarButton title="Use sample text" variant="primary" onClick={() => setInput('hello world')}>
          <Fingerprint size={16} />
          <span>Sample</span>
        </ToolbarButton>
        <ToolbarButton title="Copy all hashes" onClick={() => copyText(results.map((result) => `${result.algorithm}: ${result.value}`).join('\n'))}>
          <Copy size={16} />
          <span>Copy all</span>
        </ToolbarButton>
      </div>
    </section>
  );
}

export { HashTool };
