import { Plus } from 'lucide-react';
import { TextInputField } from '../../../components/TextInputField';
import { ToolSection } from '../../../components/ToolSection';
import { ToolbarButton } from '../../../components/ToolbarButton';
import { seasonColorDefaults } from '../seasonColorData';
import { normalizeHex } from '../seasonColorUtils';

type ManualColorSectionProps = {
  manualColor: string;
  onAdd: () => void;
  onManualColorChange: (value: string) => void;
};

function ManualColorSection({ manualColor, onAdd, onManualColorChange }: ManualColorSectionProps) {
  return (
    <ToolSection title="Manual color">
      <div className="season-color-entry">
        <input className="color-picker" type="color" value={normalizeHex(manualColor) ?? seasonColorDefaults.color} onChange={(event) => onManualColorChange(event.target.value)} title="Pick color" />
        <TextInputField label="HEX" value={manualColor} onChange={onManualColorChange} compact />
        <ToolbarButton title="Add manual color" variant="primary" onClick={onAdd}>
          <Plus size={16} />
          <span>Add</span>
        </ToolbarButton>
      </div>
    </ToolSection>
  );
}

export { ManualColorSection };
