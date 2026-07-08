import { SelectField } from '../../../components/SelectField';
import { groupMeta, photoEditableGroups } from '../seasonColorData';
import type { ColorGroup, SeasonSwatch } from '../seasonColorTypes';

type PhotoSwatchEditorProps = {
  swatches: SeasonSwatch[];
  onChange: (index: number, group: ColorGroup) => void;
};

function PhotoSwatchEditor({ swatches, onChange }: PhotoSwatchEditorProps) {
  if (swatches.length === 0) return null;

  return (
    <div className="season-photo-swatches">
      {swatches.map((swatch, index) => (
        <div className="season-photo-row" key={`${swatch.hex}-${index}`}>
          <span style={{ background: swatch.hex }} />
          <code>{swatch.hex}</code>
          <SelectField
            label="Group"
            value={swatch.group}
            options={photoEditableGroups.map((group) => ({ label: groupMeta[group].label, value: group }))}
            onChange={(group) => onChange(index, group as ColorGroup)}
            compact
          />
        </div>
      ))}
    </div>
  );
}

export { PhotoSwatchEditor };
