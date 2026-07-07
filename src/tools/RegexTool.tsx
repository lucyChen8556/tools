import { useMemo, useState } from 'react';
import { TextInputField } from '../components/TextInputField';
import { analyzeRegexPattern, collectRegexMatches } from './regex/regexUtils';
import { AnalysisColumn } from './regex/AnalysisColumn';
import { commonPatterns } from './regex/patterns';
import { buildHighlightSegments, buildRegexRules } from './regex/rules';
import { TestColumn } from './regex/TestColumn';
import type { RegexRule } from './regex/types';

function RegexTool() {
  const [presetId, setPresetId] = useState('email');
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.\\w+\\b');
  const [flags, setFlags] = useState('gi');
  const [sample, setSample] = useState('dev@example.com\nsales@example.com\nnot-an-email');
  const [activeRuleId, setActiveRuleId] = useState('');
  const [patternsOpen, setPatternsOpen] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const hasPattern = pattern.length > 0;

  function applyPreset(id: string) {
    setPresetId(id);
    const preset = commonPatterns.find((item) => item.id === id);
    if (!preset) return;
    setPattern(preset.pattern);
    setFlags(preset.flags);
    setSample(preset.sample);
    setActiveRuleId('');
  }

  function selectRule(rule: RegexRule) {
    setActiveRuleId((current) => (current === rule.id ? '' : rule.id));
  }

  const result = useMemo(() => {
    if (!hasPattern) return { error: '', matches: [] };
    return collectRegexMatches(pattern, flags, sample);
  }, [flags, hasPattern, pattern, sample]);
  const regexTokens = useMemo(() => analyzeRegexPattern(pattern), [pattern]);
  const regexRules = useMemo(() => buildRegexRules(regexTokens), [regexTokens]);
  const activeRule = regexRules.find((rule) => rule.id === activeRuleId);
  const highlightedSample = useMemo(() => {
    if (result.error) return [{ type: 'text' as const, text: sample }];
    return buildHighlightSegments(sample, result.matches);
  }, [result.error, result.matches, sample]);

  return (
    <section className="tool-surface">
      <div className="inline-controls wide">
        <TextInputField
          label="Pattern"
          value={pattern}
          compact
          onChange={(nextPattern) => {
            setPresetId('');
            setPattern(nextPattern);
            setActiveRuleId('');
          }}
        />
        <TextInputField
          label="Flags"
          value={flags}
          compact
          onChange={(nextFlags) => {
            setPresetId('');
            setFlags(nextFlags);
          }}
        />
      </div>
      <div className="regex-workspace">
        <AnalysisColumn
          activePresetId={presetId}
          activeRule={activeRule}
          activeRuleId={activeRuleId}
          applyPreset={applyPreset}
          flags={flags}
          patternsOpen={patternsOpen}
          referenceOpen={referenceOpen}
          rules={regexRules}
          selectRule={selectRule}
          setPatternsOpen={setPatternsOpen}
          setReferenceOpen={setReferenceOpen}
        />
        <TestColumn
          error={result.error}
          flags={flags}
          hasPattern={hasPattern}
          highlightedSample={highlightedSample}
          matches={result.matches}
          ruleCount={regexRules.length}
          sample={sample}
          setSample={setSample}
        />
      </div>
    </section>
  );
}

export { RegexTool };
