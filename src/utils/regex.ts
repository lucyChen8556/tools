import type { RegexMatchResult } from '../types';

export function collectRegexMatches(pattern: string, flags: string, sample: string) {
  try {
    const scanFlags = flags.includes('g') ? flags : `${flags}g`;
    const regex = new RegExp(pattern, scanFlags);
    const matches: RegexMatchResult[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(sample)) !== null) {
      matches.push({
        text: match[0],
        index: match.index,
        groups: match.slice(1),
      });

      if (match[0] === '') regex.lastIndex += 1;
    }

    return { error: '', matches };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Invalid regex',
      matches: [] as RegexMatchResult[],
    };
  }
}
