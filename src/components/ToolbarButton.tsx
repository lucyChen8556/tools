import type { ReactNode } from 'react';

export function ToolbarButton({
  children,
  icon,
  label,
  onClick,
  title,
  variant = 'secondary',
  disabled = false,
}: {
  children?: ReactNode;
  icon?: ReactNode;
  label?: ReactNode;
  onClick: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  return (
    <button className={`toolbar-button ${variant}`} type="button" onClick={onClick} title={title} disabled={disabled}>
      {children ?? (
        <>
          {icon}
          {label ? <span>{label}</span> : null}
        </>
      )}
    </button>
  );
}
