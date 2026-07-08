import type { HTMLInputTypeAttribute } from 'react';
import { Field } from './Field';

type TextInputFieldProps = {
  label: string;
  value: string | number;
  onChange?: (value: string) => void;
  compact?: boolean;
  readOnly?: boolean;
  type?: HTMLInputTypeAttribute;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  placeholder?: string;
  lang?: string;
};

function TextInputField({
  label,
  value,
  onChange,
  compact = false,
  readOnly = false,
  type = 'text',
  min,
  max,
  step,
  placeholder,
  lang,
}: TextInputFieldProps) {
  return (
    <Field label={label} compact={compact}>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        lang={lang}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      />
    </Field>
  );
}

export { TextInputField };
