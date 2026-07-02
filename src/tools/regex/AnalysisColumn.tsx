import type { RegexRule } from './types';
import { PatternBank } from './PatternBank';
import { RegexReference } from './RegexReference';

type AnalysisColumnProps = {
  activePresetId: string;
  activeRule?: RegexRule;
  activeRuleId: string;
  applyPreset: (id: string) => void;
  flags: string;
  patternsOpen: boolean;
  referenceOpen: boolean;
  rules: RegexRule[];
  selectRule: (rule: RegexRule) => void;
  setPatternsOpen: (open: boolean) => void;
  setReferenceOpen: (open: boolean) => void;
};

function AnalysisColumn({
  activePresetId,
  activeRule,
  activeRuleId,
  applyPreset,
  flags,
  patternsOpen,
  referenceOpen,
  rules,
  selectRule,
  setPatternsOpen,
  setReferenceOpen,
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
          {rules.length === 0 ? (
            <em>empty pattern</em>
          ) : (
            rules.map((rule) => (
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
            ))
          )}
          <span>/{flags}</span>
        </div>
      </section>
      <section className="regex-explanation" aria-label="Regex token explanation">
        <div className="regex-panel-title">
          <strong>Rule explanation</strong>
          <span>{activeRule ? activeRule.label : 'All rules'}</span>
        </div>
        <div className="regex-explanation-list">
          {rules.length === 0 ? (
            <div className="empty-state">Enter a pattern to see rule explanations</div>
          ) : (
            rules.map((rule, index) => (
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
            ))
          )}
        </div>
      </section>
      <RegexReference open={referenceOpen} setOpen={setReferenceOpen} />
    </div>
  );
}

export { AnalysisColumn };
