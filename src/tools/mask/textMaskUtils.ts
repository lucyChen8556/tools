import type { MaskMode } from '../../config/options';
import { textMaskRules, type TextMaskRule, type TextMaskRuleId, type TextMaskStats } from './constants';

function createEmptyStats() {
  return textMaskRules.reduce((stats, rule) => ({ ...stats, [rule.id]: 0 }), {} as TextMaskStats);
}

function fullMask(value: string) {
  return '*'.repeat(Math.min(Math.max(value.length, 4), 24));
}

function maskValue(value: string, rule: TextMaskRule, mode: MaskMode) {
  if (mode === 'full') return fullMask(value);
  if (mode === 'partial') return rule.maskPartial?.(value) ?? fullMask(value);
  return rule.placeholder;
}

function shouldMaskCreditCard(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function runTextMask(input: string, selectedRuleIds: TextMaskRuleId[], mode: MaskMode) {
  const stats = createEmptyStats();
  const output = textMaskRules.reduce((current, rule) => {
    if (!selectedRuleIds.includes(rule.id)) return current;

    return current.replace(rule.pattern, (match) => {
      if (rule.id === 'credit-card' && !shouldMaskCreditCard(match)) return match;
      stats[rule.id] += 1;
      return maskValue(match, rule, mode);
    });
  }, input);

  return { output, stats };
}

function normalizeRegexFlags(value: string) {
  return Array.from(new Set(value.replace(/[^dgimsuvy]/g, '').split(''))).join('');
}

function buildCustomRule(pattern: string, flags: string, label: string) {
  const normalizedFlags = normalizeRegexFlags(flags);
  const globalFlags = normalizedFlags.includes('g') ? normalizedFlags : `${normalizedFlags}g`;
  const regex = new RegExp(pattern, globalFlags);
  return {
    pattern: regex,
    placeholder: `[${label.trim() || 'CUSTOM'}]`,
  };
}

export { buildCustomRule, createEmptyStats, runTextMask };
