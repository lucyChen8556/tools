import { useMemo, useState } from 'react';
import { Check, ShieldCheck, Trash2 } from 'lucide-react';
import { ApplyTextButton } from '../../components/ApplyTextButton';
import { CheckboxControl } from '../../components/CheckboxControl';
import { CopyButton } from '../../components/CopyButton';
import { SelectField } from '../../components/SelectField';
import { TextInputControls } from '../../components/TextInputControls';
import { ActionBar, MetricsGrid, SplitTextAreas } from '../../components/ToolLayout';
import type { ToolMetric } from '../../components/ToolLayout';
import { ToolbarButton } from '../../components/ToolbarButton';
import { maskModeOptions, type MaskMode } from '../../config/options';
import { defaultTextMaskRuleIds, textMaskCustomRuleDefaults, textMaskDefaultMode, textMaskRules, textMaskSample, type TextMaskRuleId, type TextMaskStats } from './constants';
import { buildCustomRule, createEmptyStats, runTextMask } from './textMaskUtils';

function TextMaskPanel() {
  const [input, setInput] = useState(textMaskSample);
  const [output, setOutput] = useState('');
  const [selectedRuleIds, setSelectedRuleIds] = useState<TextMaskRuleId[]>(defaultTextMaskRuleIds);
  const [maskMode, setMaskMode] = useState<MaskMode>(textMaskDefaultMode);
  const [stats, setStats] = useState<TextMaskStats>(() => createEmptyStats());
  const [customEnabled, setCustomEnabled] = useState(false);
  const [customPattern, setCustomPattern] = useState(textMaskCustomRuleDefaults.pattern);
  const [customFlags, setCustomFlags] = useState(textMaskCustomRuleDefaults.flags);
  const [customLabel, setCustomLabel] = useState(textMaskCustomRuleDefaults.label);
  const [customMatches, setCustomMatches] = useState(0);
  const [error, setError] = useState('');

  const totalMatches = Object.values(stats).reduce((sum, count) => sum + count, 0) + customMatches;
  const metricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Total masked', value: totalMatches || '-' },
      { label: 'Input chars', value: input.length },
      { label: 'Output chars', value: output.length || '-' },
      { label: 'Active rules', value: selectedRuleIds.length },
      { label: 'Custom matches', value: customMatches || '-' },
      ...textMaskRules.map((rule) => ({ label: rule.label, value: stats[rule.id] || '-' })),
    ],
    [customMatches, input.length, output.length, selectedRuleIds.length, stats, totalMatches],
  );

  function toggleRule(ruleId: TextMaskRuleId) {
    setSelectedRuleIds((current) =>
      current.includes(ruleId) ? current.filter((item) => item !== ruleId) : [...current, ruleId],
    );
  }

  function mask() {
    try {
      const result = runTextMask(input, selectedRuleIds, maskMode);
      let nextOutput = result.output;
      let nextCustomMatches = 0;

      if (customEnabled && customPattern.trim()) {
        const customRule = buildCustomRule(customPattern, customFlags, customLabel);
        nextOutput = nextOutput.replace(customRule.pattern, () => {
          nextCustomMatches += 1;
          return customRule.placeholder;
        });
      }

      setOutput(nextOutput);
      setStats(result.stats);
      setCustomMatches(nextCustomMatches);
      setError('');
    } catch (customError) {
      setError(customError instanceof Error ? customError.message : 'Invalid custom regex');
    }
  }

  function resetSample() {
    setInput(textMaskSample);
    setOutput('');
    setSelectedRuleIds(defaultTextMaskRuleIds);
    setMaskMode(textMaskDefaultMode);
    setStats(createEmptyStats());
    setCustomEnabled(false);
    setCustomPattern(textMaskCustomRuleDefaults.pattern);
    setCustomFlags(textMaskCustomRuleDefaults.flags);
    setCustomLabel(textMaskCustomRuleDefaults.label);
    setCustomMatches(0);
    setError('');
  }

  function cleanAll() {
    setInput('');
    setOutput('');
    setSelectedRuleIds(defaultTextMaskRuleIds);
    setMaskMode(textMaskDefaultMode);
    setStats(createEmptyStats());
    setCustomEnabled(false);
    setCustomMatches(0);
    setError('');
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
      <div className="mask-custom-rule">
        <CheckboxControl label="Use custom regex rule" checked={customEnabled} onChange={setCustomEnabled} />
        <TextInputControls
          wide={false}
          controls={[
            { label: 'Custom pattern', value: customPattern, onChange: setCustomPattern, placeholder: textMaskCustomRuleDefaults.pattern },
            { label: 'Flags', value: customFlags, onChange: setCustomFlags, placeholder: textMaskCustomRuleDefaults.flags },
            { label: 'Placeholder label', value: customLabel, onChange: setCustomLabel, placeholder: textMaskCustomRuleDefaults.label },
          ]}
        />
      </div>
      {error ? <div className="notice error">{error}</div> : null}
      <ActionBar>
        <ToolbarButton title="Mask selected sensitive values" variant="primary" icon={<ShieldCheck size={16} />} label="Mask selected" onClick={mask} disabled={selectedRuleIds.length === 0 && !customEnabled} />
        <ToolbarButton title="Select default mask rules" icon={<Check size={16} />} label="Defaults" onClick={() => setSelectedRuleIds(defaultTextMaskRuleIds)} />
        <ToolbarButton title="Reset sample" icon={<ShieldCheck size={16} />} label="Sample" onClick={resetSample} />
        <ToolbarButton title="Reset text mask tool to empty" icon={<Trash2 size={16} />} label="Clean all" onClick={cleanAll} disabled={!input && !output && totalMatches === 0} />
        <ApplyTextButton value={output} onApply={setInput} label="Apply output" />
        <CopyButton title="Copy masked output" value={output} />
      </ActionBar>
      <MetricsGrid items={metricsItems} />
    </>
  );
}

export { TextMaskPanel };
