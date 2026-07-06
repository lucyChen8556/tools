import { useState } from 'react';
import { Check, ShieldCheck, Trash2 } from 'lucide-react';
import { ApplyTextButton } from '../../components/ApplyTextButton';
import { CheckboxControl } from '../../components/CheckboxControl';
import { CopyButton } from '../../components/CopyButton';
import { SelectField } from '../../components/SelectField';
import { ActionBar, MetricsGrid, SplitTextAreas } from '../../components/ToolLayout';
import { ToolbarButton } from '../../components/ToolbarButton';
import { maskModeOptions, type MaskMode } from '../../config/options';
import { defaultTextMaskRuleIds, textMaskRules, textMaskSample, type TextMaskRule, type TextMaskRuleId, type TextMaskStats } from './constants';

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

function TextMaskPanel() {
  const [input, setInput] = useState(textMaskSample);
  const [output, setOutput] = useState('');
  const [selectedRuleIds, setSelectedRuleIds] = useState<TextMaskRuleId[]>(defaultTextMaskRuleIds);
  const [maskMode, setMaskMode] = useState<MaskMode>('placeholder');
  const [stats, setStats] = useState<TextMaskStats>(() => createEmptyStats());

  const totalMatches = Object.values(stats).reduce((sum, count) => sum + count, 0);

  function toggleRule(ruleId: TextMaskRuleId) {
    setSelectedRuleIds((current) =>
      current.includes(ruleId) ? current.filter((item) => item !== ruleId) : [...current, ruleId],
    );
  }

  function mask() {
    const result = runTextMask(input, selectedRuleIds, maskMode);
    setOutput(result.output);
    setStats(result.stats);
  }

  function resetSample() {
    setInput(textMaskSample);
    setOutput('');
    setSelectedRuleIds(defaultTextMaskRuleIds);
    setMaskMode('placeholder');
    setStats(createEmptyStats());
  }

  function cleanAll() {
    setInput('');
    setOutput('');
    setSelectedRuleIds(defaultTextMaskRuleIds);
    setMaskMode('placeholder');
    setStats(createEmptyStats());
  }

  return (
    <>
      <SplitTextAreas left={{ label: 'Input', value: input, onChange: setInput }} right={{ label: 'Masked output', value: output, onChange: setOutput }} />
      <div className="inline-controls">
        <SelectField label="Mask mode" value={maskMode} options={maskModeOptions} onChange={setMaskMode} />
      </div>
      <div className="cleaner-panel">
        {textMaskRules.map((rule) => (
          <CheckboxControl key={rule.id} label={rule.label} checked={selectedRuleIds.includes(rule.id)} onChange={() => toggleRule(rule.id)} />
        ))}
      </div>
      <ActionBar>
        <ToolbarButton title="Mask selected sensitive values" variant="primary" onClick={mask} disabled={selectedRuleIds.length === 0}>
          <ShieldCheck size={16} />
          <span>Mask selected</span>
        </ToolbarButton>
        <ToolbarButton title="Select default mask rules" onClick={() => setSelectedRuleIds(defaultTextMaskRuleIds)}>
          <Check size={16} />
          <span>Defaults</span>
        </ToolbarButton>
        <ToolbarButton title="Reset sample" onClick={resetSample}>
          <ShieldCheck size={16} />
          <span>Sample</span>
        </ToolbarButton>
        <ToolbarButton title="Reset text mask tool to empty" onClick={cleanAll} disabled={!input && !output && totalMatches === 0}>
          <Trash2 size={16} />
          <span>Clean all</span>
        </ToolbarButton>
        <ApplyTextButton value={output} onApply={setInput} label="Apply output" />
        <CopyButton title="Copy masked output" value={output} />
      </ActionBar>
      <MetricsGrid
        items={[
          { label: 'Total masked', value: totalMatches || '-' },
          { label: 'Input chars', value: input.length },
          { label: 'Output chars', value: output.length || '-' },
          { label: 'Active rules', value: selectedRuleIds.length },
          ...textMaskRules.map((rule) => ({ label: rule.label, value: stats[rule.id] || '-' })),
        ]}
      />
    </>
  );
}

export { TextMaskPanel };
