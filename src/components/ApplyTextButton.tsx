import { Repeat2 } from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';

type ApplyTextButtonProps = {
  value: string;
  onApply: (value: string) => void;
  label?: string;
  title?: string;
  variant?: 'primary' | 'secondary';
};

function ApplyTextButton({
  value,
  onApply,
  label = 'Apply',
  title = 'Apply output to input',
  variant = 'secondary',
}: ApplyTextButtonProps) {
  return <ToolbarButton title={title} variant={variant} icon={<Repeat2 size={16} />} label={label} onClick={() => onApply(value)} disabled={!value} />;
}

export { ApplyTextButton };
