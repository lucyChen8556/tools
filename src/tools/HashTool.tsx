import { useEffect, useMemo, useState } from 'react';
import { Fingerprint } from 'lucide-react';
import { CopyableRows } from '../components/CopyableRows';
import { CopyButton } from '../components/CopyButton';
import { TextAreaField } from '../components/TextAreaField';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolbarButton } from '../components/ToolbarButton';
import { buildHashResults, hashAlgorithms, hashDefaults, type HashResult } from './hash/hashUtils';

function HashTool() {
  const [input, setInput] = useState(hashDefaults.input);
  const [results, setResults] = useState<HashResult[]>([]);
  const [error, setError] = useState('');
  const metricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Characters', value: input.length },
      { label: 'Bytes', value: new TextEncoder().encode(input).length },
      { label: 'Algorithms', value: hashAlgorithms.length },
      { label: 'Output format', value: 'Hex' },
    ],
    [input],
  );

  useEffect(() => {
    let cancelled = false;

    async function buildHashes() {
      try {
        const nextResults = await buildHashResults(input);
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
      <MetricsGrid items={metricsItems} />
      <CopyableRows rows={results.map((result) => ({ label: result.algorithm, value: result.value }))} />
      <ActionBar>
        <ToolbarButton title="Use sample text" variant="primary" onClick={() => setInput(hashDefaults.input)}>
          <Fingerprint size={16} />
          <span>Sample</span>
        </ToolbarButton>
        <CopyButton title="Copy all hashes" value={results.map((result) => `${result.algorithm}: ${result.value}`).join('\n')} label="Copy all" />
      </ActionBar>
    </section>
  );
}

export { HashTool };
