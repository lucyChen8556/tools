import { TextInputField } from './TextInputField';

type TextInputControl = {
  label: string;
  value: string | number;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  type?: Parameters<typeof TextInputField>[0]['type'];
  min?: string | number;
  max?: string | number;
  step?: string | number;
  placeholder?: string;
};

type TextInputControlsProps = {
  className?: string;
  controls: TextInputControl[];
  wide?: boolean;
};

function TextInputControls({ className = '', controls, wide = true }: TextInputControlsProps) {
  return (
    <div className={['inline-controls', wide ? 'wide' : '', className].filter(Boolean).join(' ')}>
      {controls.map((control) => (
        <TextInputField key={control.label} {...control} compact />
      ))}
    </div>
  );
}

export { TextInputControls };
export type { TextInputControl };
