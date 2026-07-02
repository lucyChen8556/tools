import { Field } from './Field';

type SelectOption<T extends string = string> = {
  label: string;
  value: T;
};

type SelectFieldProps<T extends string> = {
  label: string;
  value: T;
  options: ReadonlyArray<SelectOption<T>>;
  onChange: (value: T) => void;
  compact?: boolean;
};

function SelectField<T extends string>({ label, value, options, onChange, compact = true }: SelectFieldProps<T>) {
  return (
    <Field label={label} compact={compact}>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export { SelectField };
export type { SelectOption };
