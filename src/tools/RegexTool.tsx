import { useMemo, useState } from 'react';
import { Field } from '../components/Field';
import { Stat } from '../components/Stat';
import type { RegexMatchResult } from '../types';
import { collectRegexMatches } from '../utils/regex';

const commonPatterns = [
  {
    id: 'email',
    label: 'Email',
    tone: 0,
    pattern: '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}',
    flags: 'gi',
    sample: 'dev@example.com\nsales@example.co.uk\nnot-an-email',
  },
  {
    id: 'url',
    label: 'URL',
    tone: 1,
    pattern: 'https?:\\/\\/[^\\s]+',
    flags: 'gi',
    sample: 'Docs: https://example.com/docs?id=1\nLocal: http://localhost:5173',
  },
  {
    id: 'ipv4',
    label: 'IPv4',
    tone: 2,
    pattern: '\\b(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1?\\d?\\d)){3}\\b',
    flags: 'g',
    sample: 'Gateway 192.168.0.1\nInvalid 999.1.1.1\nDNS 8.8.8.8',
  },
  {
    id: 'uuid',
    label: 'UUID',
    tone: 3,
    pattern: '\\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\b',
    flags: 'gi',
    sample: '019c6e27-e55b-73d1-87d8-4e01f1f75043\nnot-a-uuid',
  },
  {
    id: 'hex-color',
    label: 'HEX color',
    tone: 4,
    pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
    flags: 'g',
    sample: '#fff\n#2F6F73\n#badhexg',
  },
  {
    id: 'iso-date',
    label: 'ISO date',
    tone: 5,
    pattern: '\\b\\d{4}-\\d{2}-\\d{2}(?:[T ][0-2]\\d:[0-5]\\d(?::[0-5]\\d(?:\\.\\d{3})?)?(?:Z|[+-][0-2]\\d:?[0-5]\\d)?)?\\b',
    flags: 'g',
    sample: '2026-07-01\n2026-07-01T15:30:00Z\n07/01/2026',
  },
  {
    id: 'time',
    label: 'Time',
    tone: 6,
    pattern: '\\b(?:[01]?\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?\\b',
    flags: 'g',
    sample: '09:30\n23:59:58\n25:00',
  },
  {
    id: 'number',
    label: 'Number',
    tone: 7,
    pattern: '[-+]?\\d*\\.?\\d+(?:[eE][-+]?\\d+)?',
    flags: 'g',
    sample: '42\n-3.14\n1.2e-5\nabc',
  },
  {
    id: 'quoted',
    label: 'Quoted string',
    tone: 8,
    pattern: `(["'])(?:(?=(\\\\?))\\2.)*?\\1`,
    flags: 'g',
    sample: `"hello world"\n'single quoted'\nplain text`,
  },
  {
    id: 'html-tag',
    label: 'HTML tag',
    tone: 9,
    pattern: '<\\/?[A-Za-z][^>]*>',
    flags: 'g',
    sample: '<div class="box">Text</div>\nplain text',
  },
  {
    id: 'cjk',
    label: 'CJK characters',
    tone: 10,
    pattern: '[\\u4E00-\\u9FFF]+',
    flags: 'g',
    sample: 'English 中文 日本語 한국어',
  },
] as const;

type HighlightSegment =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'match';
      text: string;
      index: number;
      ruleId?: string;
      label?: string;
      tone?: number;
    };

type RuleMatch = RegexMatchResult & {
  ruleId: string;
  label: string;
  tone: number;
};

function buildHighlightSegments(sample: string, matches: Array<RuleMatch | RegexMatchResult>): HighlightSegment[] {
  if (matches.length === 0) return [{ type: 'text', text: sample }];

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    if (match.text.length === 0 || match.index < cursor) return;
    if (match.index > cursor) {
      segments.push({ type: 'text', text: sample.slice(cursor, match.index) });
    }

    const ruleMatch = 'ruleId' in match ? match : null;
    segments.push({
      type: 'match',
      text: match.text,
      index,
      ruleId: ruleMatch?.ruleId,
      label: ruleMatch?.label,
      tone: ruleMatch?.tone,
    });
    cursor = match.index + match.text.length;
  });

  if (cursor < sample.length) {
    segments.push({ type: 'text', text: sample.slice(cursor) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', text: sample }];
}

function getCommonRuleMatches(sample: string) {
  const rawMatches = commonPatterns.flatMap((rule) => {
    const result = collectRegexMatches(rule.pattern, rule.flags, sample);
    if (result.error) return [];

    return result.matches.map((match) => ({
      ...match,
      ruleId: rule.id,
      label: rule.label,
      tone: rule.tone,
    }));
  });

  const sortedMatches = rawMatches.sort((first, second) => {
    if (first.index !== second.index) return first.index - second.index;
    if (first.text.length !== second.text.length) return second.text.length - first.text.length;
    return first.tone - second.tone;
  });

  return sortedMatches.reduce<RuleMatch[]>((accepted, match) => {
    const matchEnd = match.index + match.text.length;
    const overlaps = accepted.some((acceptedMatch) => {
      const acceptedEnd = acceptedMatch.index + acceptedMatch.text.length;
      return match.index < acceptedEnd && matchEnd > acceptedMatch.index;
    });

    if (!overlaps) accepted.push(match);
    return accepted;
  }, []);
}

function getRuleCounts(matches: RuleMatch[]) {
  return commonPatterns
    .map((rule) => ({
      rule,
      count: matches.filter((match) => match.ruleId === rule.id).length,
    }))
    .filter(({ count }) => count > 0);
}

function RegexTool() {
  const [presetId, setPresetId] = useState('email');
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b');
  const [flags, setFlags] = useState('gi');
  const [sample, setSample] = useState('dev@example.com\nsales@example.com\nnot-an-email');
  const [scanCommonRules, setScanCommonRules] = useState(false);

  function applyPreset(id: string) {
    setPresetId(id);
    const preset = commonPatterns.find((item) => item.id === id);
    if (!preset) return;
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setSample(preset.sample);
  }

  const result = useMemo(() => {
    return collectRegexMatches(pattern, flags, sample);
  }, [flags, pattern, sample]);

  const commonRuleMatches = useMemo(() => getCommonRuleMatches(sample), [sample]);
  const ruleCounts = useMemo(() => getRuleCounts(commonRuleMatches), [commonRuleMatches]);
  const activeMatches = scanCommonRules ? commonRuleMatches : result.matches;
  const matchCount = scanCommonRules ? commonRuleMatches.length : result.matches.length;

  const highlightedSample = useMemo<HighlightSegment[]>(() => {
    if (!scanCommonRules && result.error) return [{ type: 'text', text: sample }];
    return buildHighlightSegments(sample, activeMatches);
  }, [activeMatches, result.error, sample, scanCommonRules]);

  return (
    <section className="tool-surface">
      <div className="pattern-shortcuts" aria-label="Common regex patterns">
        {commonPatterns.map((preset) => (
          <button
            className={`pattern-chip ${presetId === preset.id ? 'active' : ''}`}
            key={preset.id}
            type="button"
            onClick={() => applyPreset(preset.id)}
            title={`Use ${preset.label} pattern`}
          >
            <span className={`pattern-dot tone-${preset.tone}`} aria-hidden="true" />
            {preset.label}
          </button>
        ))}
      </div>
      <div className="inline-controls wide">
        <Field label="Pattern" compact>
          <input
            value={pattern}
            onChange={(event) => {
              setPresetId('');
              setPattern(event.target.value);
            }}
          />
        </Field>
        <Field label="Flags" compact>
          <input
            value={flags}
            onChange={(event) => {
              setPresetId('');
              setFlags(event.target.value);
            }}
          />
        </Field>
        <label className="check-control">
          <input
            type="checkbox"
            checked={scanCommonRules}
            onChange={(event) => setScanCommonRules(event.target.checked)}
          />
          Scan common rules
        </label>
      </div>
      <Field label="Test text">
        <textarea value={sample} onChange={(event) => setSample(event.target.value)} />
      </Field>
      {!scanCommonRules && result.error ? <div className="notice error">{result.error}</div> : null}
      <div className="metrics-row">
        <Stat label="Matches" value={matchCount} />
        <Stat label={scanCommonRules ? 'Rules' : 'Flags'} value={scanCommonRules ? ruleCounts.length : flags || '-'} />
      </div>
      {scanCommonRules && ruleCounts.length > 0 ? (
        <div className="regex-legend" aria-label="Matched common rules">
          {ruleCounts.map(({ rule, count }) => (
            <span key={rule.id}>
              <span className={`pattern-dot tone-${rule.tone}`} aria-hidden="true" />
              {rule.label}
              <strong>{count}</strong>
            </span>
          ))}
        </div>
      ) : null}
      <div className="regex-preview" aria-label="Highlighted regex matches">
        {highlightedSample.map((segment, index) =>
          segment.type === 'match' ? (
            <mark
              className={segment.tone === undefined ? undefined : `tone-${segment.tone}`}
              key={`${segment.type}-${segment.index}-${index}`}
              title={segment.label}
            >
              {segment.text}
            </mark>
          ) : (
            <span key={`${segment.type}-${index}`}>{segment.text}</span>
          ),
        )}
      </div>
      <div className="match-list">
        {activeMatches.map((match, index) => {
          const rule = 'ruleId' in match ? (match as RuleMatch) : null;
          return (
            <div className="match-row" key={`${match.index}-${index}`}>
              <strong>#{index + 1}</strong>
              <code>{match.text}</code>
              {rule ? (
                <span className="rule-badge">
                  <span className={`pattern-dot tone-${rule.tone}`} aria-hidden="true" />
                  {rule.label}
                </span>
              ) : null}
              <span>@ {match.index}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
export { RegexTool };
