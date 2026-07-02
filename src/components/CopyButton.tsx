import { Copy } from 'lucide-react';
import { copyText } from '../utils/clipboard';
import { ToolbarButton } from './ToolbarButton';

type CopyButtonProps = {
  value: string;
  label?: string;
  title?: string;
  disabled?: boolean;
};

function CopyButton({ value, label = 'Copy', title = 'Copy', disabled }: CopyButtonProps) {
  return (
    <ToolbarButton title={title} onClick={() => copyText(value)} disabled={disabled ?? !value}>
      <Copy size={16} />
      <span>{label}</span>
    </ToolbarButton>
  );
}

export { CopyButton };
