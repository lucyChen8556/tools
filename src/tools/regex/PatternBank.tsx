import { ChevronDown } from 'lucide-react';
import { commonPatterns } from './patterns';

type PatternBankProps = {
  activePresetId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  applyPreset: (id: string) => void;
};

function PatternBank({ activePresetId, open, setOpen, applyPreset }: PatternBankProps) {
  return (
    <section className="regex-pattern-bank">
      <button
        className="regex-collapse-button"
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <strong>Common patterns</strong>
        <span>{open ? 'Hide' : 'Show'}</span>
        <ChevronDown className={open ? 'open' : ''} size={16} />
      </button>
      <div className={`regex-collapsible ${open ? 'open' : ''}`}>
        <div className="pattern-shortcuts" aria-label="Common regex patterns">
          {commonPatterns.map((preset) => (
            <button
              className={`pattern-chip ${activePresetId === preset.id ? 'active' : ''}`}
              key={preset.id}
              type="button"
              tabIndex={open ? 0 : -1}
              onClick={() => applyPreset(preset.id)}
              title={`Use ${preset.label} pattern`}
            >
              <span className={`pattern-dot tone-${preset.tone}`} aria-hidden="true" />
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export { PatternBank };
