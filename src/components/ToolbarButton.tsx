import type { ReactNode } from 'react';

export function ToolbarButton({
  children,
  onClick,
  title,
  variant = 'secondary',
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  return (
    <button className={`toolbar-button ${variant}`} type="button" onClick={onClick} title={title} disabled={disabled}>
      {children}
    </button>
  );
}
