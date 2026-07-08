import { ImageUp, Sparkles, Trash2 } from 'lucide-react';
import { ActionBar } from '../../../components/ToolLayout';
import { ToolSection } from '../../../components/ToolSection';
import { ToolbarButton } from '../../../components/ToolbarButton';
import type { ColorGroup, SeasonSwatch } from '../seasonColorTypes';
import { PhotoSwatchEditor } from './PhotoSwatchEditor';

type PhotoExtractionSectionProps = {
  loading: boolean;
  onApplyPhotoSwatches: () => void;
  onClearPhoto: () => void;
  onLoadPhoto: (file: File | null) => void;
  onUpdatePhotoGroup: (index: number, group: ColorGroup) => void;
  photoStatus: string;
  photoSwatches: SeasonSwatch[];
  photoUrl: string | null;
};

function PhotoExtractionSection({
  loading,
  onApplyPhotoSwatches,
  onClearPhoto,
  onLoadPhoto,
  onUpdatePhotoGroup,
  photoStatus,
  photoSwatches,
  photoUrl,
}: PhotoExtractionSectionProps) {
  return (
    <ToolSection title="Photo extraction">
      <label className="season-photo-drop">
        <input type="file" accept="image/*" onChange={(event) => onLoadPhoto(event.target.files?.[0] ?? null)} />
        {photoUrl ? <img src={photoUrl} alt="Uploaded color reference" /> : <span><ImageUp size={18} /> Upload image</span>}
      </label>
      <p className="season-hint">{photoStatus}</p>
      <PhotoSwatchEditor swatches={photoSwatches} onChange={onUpdatePhotoGroup} />
      <ActionBar>
        <ToolbarButton title="Use extracted photo swatches" variant="primary" disabled={loading || photoSwatches.length === 0} onClick={onApplyPhotoSwatches}>
          <Sparkles size={16} />
          <span>Use photo colors</span>
        </ToolbarButton>
        <ToolbarButton title="Clear photo" onClick={onClearPhoto}>
          <Trash2 size={16} />
          <span>Clear photo</span>
        </ToolbarButton>
      </ActionBar>
    </ToolSection>
  );
}

export { PhotoExtractionSection };
