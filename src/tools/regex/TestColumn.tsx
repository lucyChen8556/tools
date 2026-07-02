import { Field } from '../../components/Field';
import { Stat } from '../../components/Stat';
import type { RegexMatchResult } from '../../types';
import type { HighlightSegment } from './types';

type TestColumnProps = {
  error: string;
  flags: string;
  hasPattern: boolean;
  highlightedSample: HighlightSegment[];
  matches: RegexMatchResult[];
  ruleCount: number;
  sample: string;
  setSample: (sample: string) => void;
};

function TestColumn({ error, flags, hasPattern, highlightedSample, matches, ruleCount, sample, setSample }: TestColumnProps) {
  return (
    <div className="regex-test-column">
      <Field label="Test text">
        <textarea value={sample} onChange={(event) => setSample(event.target.value)} />
      </Field>
      {error ? <div className="notice error">{error}</div> : null}
      <div className="metrics-row">
        <Stat label="Matches" value={matches.length} />
        <Stat label="Rules" value={ruleCount} />
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
      {hasPattern ? (
        <div className="match-list">
          <div className="regex-panel-title">
            <strong>Match Information</strong>
            <span>{matches.length}</span>
          </div>
          {matches.length === 0 ? (
            <div className="empty-state">No matches</div>
          ) : (
            matches.map((match, index) => (
              <div className="match-row" key={`${match.index}-${index}`}>
                <strong>Match {index + 1}</strong>
                <code>{match.text}</code>
                <span>
                  {match.index}-{match.end}
                </span>
                {match.groups.length > 0 ? (
                  <div className="match-groups">
                    {match.groups.map((group, groupIndex) => (
                      <span key={`${groupIndex}-${group.index}-${group.text}`}>
                        <strong>{group.name ?? `Group ${groupIndex + 1}`}</strong>
                        <code>{group.text || '(empty)'}</code>
                        <small>{group.index > -1 ? `${group.index}-${group.end}` : '-'}</small>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

export { TestColumn };
