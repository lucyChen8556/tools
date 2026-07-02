import { useEffect, useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { CopyableRows } from '../components/CopyableRows';
import { CopyButton } from '../components/CopyButton';
import { TextAreaField } from '../components/TextAreaField';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import { ToolbarButton } from '../components/ToolbarButton';

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
      <TextAreaField label="Input" value={input} onChange={setInput} />
      {error ? <div className="notice error">{error}</div> : null}
      <MetricsGrid
        items={[
          { label: 'Characters', value: input.length },
          { label: 'Bytes', value: new TextEncoder().encode(input).length },
          { label: 'Algorithms', value: hashAlgorithms.length },
          { label: 'Output format', value: 'Hex' },
        ]}
      />
      <CopyableRows rows={results.map((result) => ({ label: result.algorithm, value: result.value }))} />
      <ActionBar>
        <ToolbarButton title="Use sample text" variant="primary" onClick={() => setInput('hello world')}>
          <Fingerprint size={16} />
          <span>Sample</span>
        </ToolbarButton>
        <CopyButton title="Copy all hashes" value={results.map((result) => `${result.algorithm}: ${result.value}`).join('\n')} label="Copy all" />
      </ActionBar>
    </section>
  );
}

export { HashTool };
