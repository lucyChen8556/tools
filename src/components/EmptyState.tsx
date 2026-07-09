import type { ReactNode } from 'react';

type EmptyStateProps = {
  children?: ReactNode;
  className?: string;
  compact?: boolean;
  description?: ReactNode;
  title?: ReactNode;
};

function EmptyState({ children, className = '', compact = false, description, title }: EmptyStateProps) {
  const content = title || description ? (
    <>
      {title ? <strong>{title}</strong> : null}
      {description ? <span>{description}</span> : null}
      {children}
    </>
  ) : (
    children
  );

  return <div className={['empty-state', compact ? 'compact' : '', className].filter(Boolean).join(' ')}>{content}</div>;
}

export { EmptyState };
