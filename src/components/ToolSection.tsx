import type { ReactNode } from 'react';

type ToolSectionProps = {
  title?: string;
  children: ReactNode;
};

function ToolSection({ title, children }: ToolSectionProps) {
  return (
    <section className="tool-section">
      {title ? <h3>{title}</h3> : null}
      {children}
    </section>
  );
}

export { ToolSection };
