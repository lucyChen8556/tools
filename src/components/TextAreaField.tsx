import { Field } from './Field';

type TextAreaFieldProps = {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  spellCheck?: boolean;
};

function TextAreaField({ label, value, onChange, readOnly = false, className, spellCheck }: TextAreaFieldProps) {
  return (
    <Field label={label}>
      <textarea
        className={className}
        value={value}
        readOnly={readOnly}
        spellCheck={spellCheck}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      />
    </Field>
  );
}

export { TextAreaField };
