import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import type { ToolHelp } from '../config/toolHelp';

type ToolHelpDialogProps = {
  group: string;
  help: ToolHelp;
  icon: ReactNode;
  name: string;
  onClose: () => void;
};

function ToolHelpDialog({ group, help, icon, name, onClose }: ToolHelpDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <section
        className="tool-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tool-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="tool-dialog-header">
          <span className="workspace-icon">{icon}</span>
          <div>
            <p>{group}</p>
            <h2 id="tool-dialog-title">{name}</h2>
          </div>
          <button className="dialog-close" type="button" onClick={onClose} title="Close dialog" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <p className="tool-dialog-overview">{help.overview}</p>

        <div className="tool-dialog-sections">
          {help.sections.map((section) => (
            <section className="tool-dialog-section" key={section.title}>
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}

export { ToolHelpDialog };
