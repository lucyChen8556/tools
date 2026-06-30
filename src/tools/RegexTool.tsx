import { useMemo, useState } from 'react';
import { Field } from '../components/Field';
import { Stat } from '../components/Stat';
import type { HighlightSegment } from '../types';
import { collectRegexMatches } from '../utils/regex';

function RegexTool() {
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b');
  const [flags, setFlags] = useState('gi');
  const [sample, setSample] = useState('dev@example.com\nsales@example.com\nnot-an-email');

  const result = useMemo(() => {
    return collectRegexMatches(pattern, flags, sample);
  }, [flags, pattern, sample]);

  const highlightedSample = useMemo<HighlightSegment[]>(() => {
    if (result.error || result.matches.length === 0) return [{ type: 'text', text: sample }];

    const segments: HighlightSegment[] = [];
    let cursor = 0;

    result.matches.forEach((match, index) => {
      if (match.text.length === 0) return;
      if (match.index > cursor) {
        segments.push({ type: 'text', text: sample.slice(cursor, match.index) });
      }
      segments.push({ type: 'match', text: match.text, index });
      cursor = match.index + match.text.length;
    });

    if (cursor < sample.length) {
      segments.push({ type: 'text', text: sample.slice(cursor) });
    }

    return segments.length > 0 ? segments : [{ type: 'text', text: sample }];
  }, [result.error, result.matches, sample]);

  return (
    <section className="tool-surface">
      <div className="inline-controls wide">
        <Field label="Pattern" compact>
          <input value={pattern} onChange={(event) => setPattern(event.target.value)} />
        </Field>
        <Field label="Flags" compact>
          <input value={flags} onChange={(event) => setFlags(event.target.value)} />
        </Field>
      </div>
      <Field label="Test text">
        <textarea value={sample} onChange={(event) => setSample(event.target.value)} />
      </Field>
      {result.error ? <div className="notice error">{result.error}</div> : null}
      <div className="metrics-row">
        <Stat label="Matches" value={result.matches.length} />
        <Stat label="Flags" value={flags || '-'} />
      </div>
      <div className="regex-preview" aria-label="Highlighted regex matches">
        {highlightedSample.map((segment, index) =>
          segment.type === 'match' ? (
            <mark key={`${segment.type}-${segment.index}-${index}`}>{segment.text}</mark>
          ) : (
            <span key={`${segment.type}-${index}`}>{segment.text}</span>
          ),
        )}
      </div>
      <div className="match-list">
        {result.matches.map((match, index) => (
          <div className="match-row" key={`${match.index}-${index}`}>
            <strong>#{index + 1}</strong>
            <code>{match.text}</code>
            <span>@ {match.index}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
export { RegexTool };
