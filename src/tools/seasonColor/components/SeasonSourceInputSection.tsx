import type { usePhotoSwatches } from '../usePhotoSwatches';
import type { SeasonKey } from '../seasonColorTypes';
import { PhotoExtractionSection } from './PhotoExtractionSection';
import { SwatchInputSection } from './SwatchInputSection';

type SeasonSourceMode = 'swatches' | 'photo';

type SeasonSourceInputSectionProps = {
  bulkInput: string;
  photo: ReturnType<typeof usePhotoSwatches>;
  sourceMode: SeasonSourceMode;
  status: string;
  onAnalyze: () => void;
  onBulkInputChange: (value: string) => void;
  onLoadSample: () => void;
  onQuickPaletteSelect: (season: SeasonKey) => void;
};

function SeasonSourceInputSection({
  bulkInput,
  photo,
  sourceMode,
  status,
  onAnalyze,
  onBulkInputChange,
  onLoadSample,
  onQuickPaletteSelect,
}: SeasonSourceInputSectionProps) {
  if (sourceMode === 'photo') {
    return (
      <PhotoExtractionSection
        loading={photo.loading}
        onApplyPhotoSwatches={photo.applyPhotoSwatches}
        onClearPhoto={photo.clearPhoto}
        onLoadPhoto={photo.loadPhoto}
        onUpdatePhotoGroup={photo.updatePhotoGroup}
        photoStatus={photo.photoStatus}
        photoSwatches={photo.photoSwatches}
        photoUrl={photo.photoUrl}
      />
    );
  }

  return (
    <SwatchInputSection
      bulkInput={bulkInput}
      onAnalyze={onAnalyze}
      onBulkInputChange={onBulkInputChange}
      onLoadSample={onLoadSample}
      onQuickPaletteSelect={onQuickPaletteSelect}
      status={status}
    />
  );
}

export { SeasonSourceInputSection };
