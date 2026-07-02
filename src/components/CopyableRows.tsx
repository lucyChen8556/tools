import { Copy } from 'lucide-react';
import { copyText } from '../utils/clipboard';
import { ToolbarButton } from './ToolbarButton';

type CopyableRow = {
  label: string;
  value: string;
};

function CopyableRows({ rows }: { rows: CopyableRow[] }) {
  return (
    <div className="hash-list">
      {rows.map((row) => (
        <div className="hash-row" key={row.label}>
          <strong>{row.label}</strong>
          <code>{row.value}</code>
          <ToolbarButton title={`Copy ${row.label}`} onClick={() => copyText(row.value)}>
            <Copy size={15} />
            <span>Copy</span>
          </ToolbarButton>
        </div>
      ))}
    </div>
  );
}

export { CopyableRows };
export type { CopyableRow };
