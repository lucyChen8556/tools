import { useMemo, useState } from 'react';
import { Clock3 } from 'lucide-react';
import { Field } from '../components/Field';
import { Stat } from '../components/Stat';
import { ToolbarButton } from '../components/ToolbarButton';

function TimeTool() {
  const [value, setValue] = useState(() => String(Date.now()));
  const date = useMemo(() => {
    const trimmed = value.trim();
    if (/^\d{10}$/.test(trimmed)) return new Date(Number(trimmed) * 1000);
    if (/^\d{13}$/.test(trimmed)) return new Date(Number(trimmed));
    return new Date(trimmed);
  }, [value]);
  const valid = !Number.isNaN(date.getTime());
  const now = new Date();

  return (
    <section className="tool-surface">
      <div className="inline-controls wide">
        <Field label="Input" compact>
          <input value={value} onChange={(event) => setValue(event.target.value)} />
        </Field>
        <ToolbarButton title="Use current time" variant="primary" onClick={() => setValue(String(Date.now()))}>
          <Clock3 size={16} />
          <span>Now</span>
        </ToolbarButton>
      </div>
      <div className="metrics-row">
        <Stat label="Unix seconds" value={valid ? Math.floor(date.getTime() / 1000) : '-'} />
        <Stat label="Unix milliseconds" value={valid ? date.getTime() : '-'} />
        <Stat label="Current seconds" value={Math.floor(now.getTime() / 1000)} />
        <Stat label="Current ms" value={now.getTime()} />
      </div>
      <div className="output-grid">
        <Field label="Local">
          <input readOnly value={valid ? date.toLocaleString() : 'Invalid date'} />
        </Field>
        <Field label="ISO">
          <input readOnly value={valid ? date.toISOString() : 'Invalid date'} />
        </Field>
        <Field label="UTC">
          <input readOnly value={valid ? date.toUTCString() : 'Invalid date'} />
        </Field>
      </div>
    </section>
  );
}
export { TimeTool };
