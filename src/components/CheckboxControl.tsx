type CheckboxControlProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function CheckboxControl({ label, checked, onChange }: CheckboxControlProps) {
  return (
    <label className="check-control">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export { CheckboxControl };
