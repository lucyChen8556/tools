import type { RegexCaptureGroup, RegexMatchResult } from '@/types';

export type RegexTokenKind =
  | 'literal'
  | 'escape'
  | 'character-class'
  | 'quantifier'
  | 'group'
  | 'anchor'
  | 'alternation'
  | 'wildcard';

export type RegexToken = {
  id: string;
  text: string;
  start: number;
  end: number;
  kind: RegexTokenKind;
  label: string;
  description: string;
  details: string[];
  appliesTo?: string;
  tone: number;
};

const tokenToneByKind: Record<RegexTokenKind, number> = {
  literal: 0,
  escape: 1,
  'character-class': 2,
  quantifier: 5,
  group: 7,
  anchor: 8,
  alternation: 4,
  wildcard: 6,
};

const regexSyntaxChars = new Set(['\\', '[', ']', '(', ')', '{', '}', '*', '+', '?', '|', '^', '$', '.']);

export function collectRegexMatches(pattern: string, flags: string, sample: string) {
  try {
    const scanFlags = flags.includes('g') ? flags : `${flags}g`;
    let regex = new RegExp(pattern, scanFlags);
    let hasIndices = false;

    try {
      const indexFlags = scanFlags.includes('d') ? scanFlags : `${scanFlags}d`;
      regex = new RegExp(pattern, indexFlags);
      hasIndices = true;
    } catch {
      regex = new RegExp(pattern, scanFlags);
    }

    const matches: RegexMatchResult[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(sample)) !== null) {
      const currentMatch = match;
      const indexedMatch = currentMatch as RegExpExecArray & {
        indices?: Array<[number, number] | undefined> & {
          groups?: Record<string, [number, number]>;
        };
      };
      const groupNamesByIndex = new Map<number, string>();
      const namedGroups = currentMatch.groups ?? {};
      const namedIndices = indexedMatch.indices?.groups ?? {};

      Object.entries(namedGroups).forEach(([name, value]) => {
        const range = namedIndices[name];
        const groupIndex = currentMatch.findIndex((groupValue, currentIndex) => currentIndex > 0 && groupValue === value);
        if (groupIndex > 0 && range) groupNamesByIndex.set(groupIndex, name);
      });

      const groups: RegexCaptureGroup[] = currentMatch.slice(1).map((groupText, groupIndex) => {
        const range = hasIndices ? indexedMatch.indices?.[groupIndex + 1] : undefined;
        const text = groupText ?? '';
        return {
          name: groupNamesByIndex.get(groupIndex + 1),
          text,
          index: range?.[0] ?? -1,
          end: range?.[1] ?? -1,
        };
      });

      matches.push({
        text: currentMatch[0],
        index: currentMatch.index,
        end: currentMatch.index + currentMatch[0].length,
        groups,
      });

      if (currentMatch[0] === '') regex.lastIndex += 1;
    }

    return { error: '', matches };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Invalid regex',
      matches: [] as RegexMatchResult[],
    };
  }
}

function describeEscape(token: string) {
  const escaped = token.slice(1);
  const descriptions: Record<string, string> = {
    d: 'matches any digit character.',
    D: 'matches any non-digit character.',
    w: 'matches any word character.',
    W: 'matches any non-word character.',
    s: 'matches any whitespace character.',
    S: 'matches any non-whitespace character.',
    b: 'matches a word boundary.',
    B: 'matches a non-word boundary.',
    t: 'matches a tab character.',
    r: 'matches a carriage return.',
    n: 'matches a line feed.',
  };

  if (/^\d+$/.test(escaped)) return `references capture group ${escaped}.`;
  if (escaped.startsWith('u')) return 'matches the unicode escape sequence.';
  if (escaped.startsWith('x')) return 'matches the hex escape sequence.';
  if (escaped.startsWith('p{') || escaped.startsWith('P{')) return 'matches a unicode property class.';
  return descriptions[escaped] ?? `matches the character ${escaped} literally.`;
}

function describeQuantifier(token: string, appliesTo?: string) {
  const lazy = token.endsWith('?') && token !== '?';
  const base = lazy ? token.slice(0, -1) : token;
  const suffix = lazy ? ' Uses lazy matching.' : '';
  const target = appliesTo ? ` (${appliesTo})` : '';

  if (base === '*') return `matches the previous token${target} zero or more times.${suffix}`;
  if (base === '+') return `matches the previous token${target} one or more times.${suffix}`;
  if (base === '?') return `matches the previous token${target} zero or one times.${suffix}`;
  return `matches the previous token${target} ${base} times.${suffix}`;
}

function describeGroup(token: string) {
  if (token === '(') return 'starts a capturing group.';
  if (token === '(?:') return 'starts a non-capturing group.';
  if (token === '(?=') return 'starts a positive lookahead.';
  if (token === '(?!') return 'starts a negative lookahead.';
  if (token === '(?<=') return 'starts a positive lookbehind.';
  if (token === '(?<!') return 'starts a negative lookbehind.';
  if (token.startsWith('(?<')) return 'starts a named capturing group.';
  return 'starts a regex group.';
}

function findClosingCharacter(pattern: string, start: number, closing: string) {
  let escaped = false;
  for (let index = start; index < pattern.length; index += 1) {
    const char = pattern[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === closing) return index;
  }
  return -1;
}

function describeCharacterClass(token: string) {
  const body = token.replace(/^\[\^?/, '').replace(/\]$/, '');
  const details: string[] = [];

  if (token.startsWith('[^')) details.push('^ negates the character class.');

  const rangeMatches = body.match(/(?:^|[^\\])([A-Za-z0-9])-([A-Za-z0-9])/g) ?? [];
  rangeMatches.forEach((range) => {
    const cleanRange = range.slice(range.length - 3);
    details.push(`${cleanRange} defines a character range.`);
  });

  const escapeMatches = body.match(/\\[dDwWsSbBtrn./\\]/g) ?? [];
  escapeMatches.forEach((escapeToken) => {
    details.push(`${escapeToken} ${describeEscape(escapeToken)}`);
  });

  if (details.length === 0 && body) details.push(`${body} is the allowed character set.`);
  return details;
}

function pushToken(
  tokens: RegexToken[],
  pattern: string,
  start: number,
  end: number,
  kind: RegexTokenKind,
  label: string,
  description: string,
  details: string[] = [],
  appliesTo?: string,
) {
  const text = pattern.slice(start, end);
  tokens.push({
    id: `${start}-${end}-${kind}`,
    text,
    start,
    end,
    kind,
    label,
    description,
    details,
    appliesTo,
    tone: tokenToneByKind[kind],
  });
}

export function analyzeRegexPattern(pattern: string) {
  const tokens: RegexToken[] = [];
  let index = 0;

  while (index < pattern.length) {
    const char = pattern[index];

    if (char === '\\') {
      let end = Math.min(index + 2, pattern.length);
      if ((pattern[index + 1] === 'u' || pattern[index + 1] === 'x') && pattern[index + 2]) {
        end = Math.min(index + (pattern[index + 1] === 'u' ? 6 : 4), pattern.length);
      }
      if ((pattern[index + 1] === 'p' || pattern[index + 1] === 'P') && pattern[index + 2] === '{') {
        const closingIndex = pattern.indexOf('}', index + 3);
        if (closingIndex > -1) end = closingIndex + 1;
      }

      const token = pattern.slice(index, end);
      const kind = ['\\b', '\\B'].includes(token) ? 'anchor' : 'escape';
      pushToken(tokens, pattern, index, end, kind, kind === 'anchor' ? 'Boundary' : 'Escaped token', describeEscape(token));
      index = end;
      continue;
    }

    if (char === '[') {
      const closingIndex = findClosingCharacter(pattern, index + 1, ']');
      const end = closingIndex > -1 ? closingIndex + 1 : pattern.length;
      const token = pattern.slice(index, end);
      const negated = token.startsWith('[^');
      pushToken(
        tokens,
        pattern,
        index,
        end,
        'character-class',
        negated ? 'Negated character class' : 'Character class',
        negated ? 'matches a single character not present in this set.' : 'matches a single character present in this set.',
        describeCharacterClass(token),
      );
      index = end;
      continue;
    }

    if (char === '(') {
      const namedGroupEnd = pattern.startsWith('(?<', index) ? pattern.indexOf('>', index + 3) : -1;
      const knownPrefixes = ['(?<=', '(?<!', '(?:', '(?=', '(?!'];
      const prefix = knownPrefixes.find((item) => pattern.startsWith(item, index));
      const end = namedGroupEnd > -1 ? namedGroupEnd + 1 : index + (prefix?.length ?? 1);
      const token = pattern.slice(index, end);
      pushToken(tokens, pattern, index, end, 'group', 'Group start', describeGroup(token));
      index = end;
      continue;
    }

    if (char === ')') {
      pushToken(tokens, pattern, index, index + 1, 'group', 'Group end', 'ends the current group.');
      index += 1;
      continue;
    }

    if (['*', '+', '?'].includes(char)) {
      const end = pattern[index + 1] === '?' ? index + 2 : index + 1;
      const appliesTo = tokens[tokens.length - 1]?.text;
      pushToken(
        tokens,
        pattern,
        index,
        end,
        'quantifier',
        'Quantifier',
        describeQuantifier(pattern.slice(index, end), appliesTo),
        appliesTo ? [`Applies to ${appliesTo}.`] : [],
        appliesTo,
      );
      index = end;
      continue;
    }

    if (char === '{') {
      const closingIndex = pattern.indexOf('}', index + 1);
      const end = closingIndex > -1 ? closingIndex + 1 + (pattern[closingIndex + 1] === '?' ? 1 : 0) : index + 1;
      const token = pattern.slice(index, end);
      if (/^\{\d*,?\d*\}\??$/.test(token)) {
        const appliesTo = tokens[tokens.length - 1]?.text;
        pushToken(
          tokens,
          pattern,
          index,
          end,
          'quantifier',
          'Quantifier',
          describeQuantifier(token, appliesTo),
          appliesTo ? [`Applies to ${appliesTo}.`] : [],
          appliesTo,
        );
        index = end;
        continue;
      }
    }

    if (char === '^' || char === '$') {
      pushToken(tokens, pattern, index, index + 1, 'anchor', 'Anchor', char === '^' ? 'asserts the start of the input.' : 'asserts the end of the input.');
      index += 1;
      continue;
    }

    if (char === '|') {
      pushToken(tokens, pattern, index, index + 1, 'alternation', 'Alternation', 'matches either the expression before or after this token.');
      index += 1;
      continue;
    }

    if (char === '.') {
      pushToken(tokens, pattern, index, index + 1, 'wildcard', 'Wildcard', 'matches any character except line breaks.');
      index += 1;
      continue;
    }

    let end = index + 1;
    while (end < pattern.length && !regexSyntaxChars.has(pattern[end])) {
      end += 1;
    }

    if (end - index > 1 && ['*', '+', '?', '{'].includes(pattern[end] ?? '')) {
      pushToken(tokens, pattern, index, end - 1, 'literal', 'Literal', `matches ${pattern.slice(index, end - 1)} literally.`);
      pushToken(tokens, pattern, end - 1, end, 'literal', 'Literal', `matches ${pattern.slice(end - 1, end)} literally.`);
      index = end;
      continue;
    }

    pushToken(tokens, pattern, index, end, 'literal', 'Literal', `matches ${pattern.slice(index, end)} literally.`);
    index = end;
  }

  return tokens;
}
