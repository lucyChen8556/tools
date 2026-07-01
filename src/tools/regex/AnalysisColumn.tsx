import type { RegexRule } from './types';
import { PatternBank } from './PatternBank';

type AnalysisColumnProps = {
  activePresetId: string;
  activeRule?: RegexRule;
  activeRuleId: string;
  applyPreset: (id: string) => void;
  flags: string;
  patternsOpen: boolean;
  rules: RegexRule[];
  selectRule: (rule: RegexRule) => void;
  setPatternsOpen: (open: boolean) => void;
};

function AnalysisColumn({
  activePresetId,
  activeRule,
  activeRuleId,
  applyPreset,
  flags,
  patternsOpen,
  rules,
  selectRule,
  setPatternsOpen,
}: AnalysisColumnProps) {
  return (
    <div className="regex-rule-column">
      <PatternBank activePresetId={activePresetId} open={patternsOpen} setOpen={setPatternsOpen} applyPreset={applyPreset} />
      <section className="regex-pattern-panel" aria-label="Regex pattern analysis">
        <div className="regex-panel-title">
          <strong>Expression</strong>
          <span>{rules.length} rules</span>
        </div>
        <div className="regex-expression-preview">
          <span>/</span>
          {rules.map((rule) => (
            <button
              className={`regex-expression-rule tone-${rule.tone} ${activeRuleId === rule.id ? 'active' : ''}`}
              key={rule.id}
              type="button"
              onClick={() => selectRule(rule)}
              aria-label={`${rule.text}: ${rule.label}`}
              title={rule.description}
            >
              {rule.text}
            </button>
          ))}
          <span>/{flags}</span>
        </div>
      </section>
      <section className="regex-explanation" aria-label="Regex token explanation">
        <div className="regex-panel-title">
          <strong>Rule explanation</strong>
          <span>{activeRule ? activeRule.label : 'All rules'}</span>
        </div>
        <div className="regex-explanation-list">
          {rules.map((rule, index) => (
            <button
              className={`regex-explanation-row ${activeRuleId === rule.id ? 'active' : ''}`}
              key={rule.id}
              type="button"
              onClick={() => selectRule(rule)}
            >
              <mark className={`tone-${rule.tone}`}>{rule.text}</mark>
              <span>
                <strong>{rule.label}</strong>
                {rule.description}
                {rule.details.length > 0 ? (
                  <ul>
                    {rule.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                ) : null}
              </span>
              <code>
                {rule.start}-{rule.end}
              </code>
              <small>#{index + 1}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export { AnalysisColumn };
