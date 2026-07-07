import type { RegexToken } from './regexUtils';
import type { HighlightSegment, RegexRule } from './types';

function canAttachQuantifier(token: RegexRule) {
  return !['(', ')', '|', '^', '$'].includes(token.text);
}

export function buildRegexRules(tokens: RegexToken[]) {
  return tokens.reduce<RegexRule[]>((rules, token) => {
    if (token.kind === 'quantifier') {
      const previousRule = rules[rules.length - 1];
      if (previousRule && canAttachQuantifier(previousRule)) {
        previousRule.id = `${previousRule.id}-${token.id}`;
        previousRule.text = `${previousRule.text}${token.text}`;
        previousRule.label = 'Quantified token';
        previousRule.description = `${previousRule.description} ${token.description}`;
        previousRule.details = [...previousRule.details, ...token.details];
        previousRule.end = token.end;
        previousRule.tone = token.tone;
        return rules;
      }
    }

    rules.push({
      id: token.id,
      text: token.text,
      label: token.label,
      description: token.description,
      details: token.details,
      start: token.start,
      end: token.end,
      tone: token.tone,
    });
    return rules;
  }, []);
}

export function buildHighlightSegments(sample: string, matches: Array<{ text: string; index: number }>): HighlightSegment[] {
  if (matches.length === 0) return [{ type: 'text', text: sample }];

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    if (match.text.length === 0 || match.index < cursor) return;
    if (match.index > cursor) {
      segments.push({ type: 'text', text: sample.slice(cursor, match.index) });
    }

    segments.push({
      type: 'match',
      text: match.text,
      index,
    });
    cursor = match.index + match.text.length;
  });

  if (cursor < sample.length) {
    segments.push({ type: 'text', text: sample.slice(cursor) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', text: sample }];
}
