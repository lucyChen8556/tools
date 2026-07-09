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
  return <ToolbarButton title={title} icon={<Copy size={16} />} label={label} onClick={() => copyText(value)} disabled={disabled ?? !value} />;
}

export { CopyButton };
