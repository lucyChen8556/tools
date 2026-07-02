import type { ReactNode } from 'react';
import { Stat } from './Stat';
import { TextAreaField } from './TextAreaField';

type ToolMetric = {
  label: string;
  value: string | number;
};

type TextAreaPanel = {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  spellCheck?: boolean;
};

function ActionBar({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={['action-bar', className].filter(Boolean).join(' ')}>{children}</div>;
}

function MetricsGrid({ items }: { items: ToolMetric[] }) {
  return (
    <div className="metrics-row">
      {items.map((item) => (
        <Stat key={item.label} label={item.label} value={item.value} />
      ))}
    </div>
  );
}

function SplitTextAreas({ left, right, compact = false }: { left: TextAreaPanel; right: TextAreaPanel; compact?: boolean }) {
  return (
    <div className={['split-editor', compact ? 'compact-preview' : ''].filter(Boolean).join(' ')}>
      <TextAreaField {...left} />
      <TextAreaField {...right} />
    </div>
  );
}

export { ActionBar, MetricsGrid, SplitTextAreas };
export type { TextAreaPanel, ToolMetric };
