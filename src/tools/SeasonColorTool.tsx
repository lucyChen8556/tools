import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { CurrentSamplesSection } from './seasonColor/components/CurrentSamplesSection';
import { ManualColorSection } from './seasonColor/components/ManualColorSection';
import { PhotoExtractionSection } from './seasonColor/components/PhotoExtractionSection';
import { SeasonResultContent } from './seasonColor/components/SeasonResultContent';
import { SwatchInputSection } from './seasonColor/components/SwatchInputSection';
import { quickPalettes, seasonColorDefaults, seasonData } from './seasonColor/seasonColorData';
import {
  analyzeSwatches,
  getSeasonView,
  normalizeHex,
  parseBulkSwatches,
} from './seasonColor/seasonColorUtils';
import type { SeasonKey, SeasonSwatch } from './seasonColor/seasonColorTypes';
import { usePhotoSwatches } from './seasonColor/usePhotoSwatches';

const sourceOptions = [
  { label: 'Swatches', value: 'swatches' },
  { label: 'Photo', value: 'photo' },
] as const;

function SeasonColorTool() {
  const [sourceMode, setSourceMode] = useState<(typeof sourceOptions)[number]['value']>('swatches');
  const [bulkInput, setBulkInput] = useState(seasonColorDefaults.bulkInput);
  const [status, setStatus] = useState(seasonColorDefaults.status);
  const [manualColor, setManualColor] = useState(seasonColorDefaults.color);
  const [swatches, setSwatches] = useState<SeasonSwatch[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<SeasonKey | null>(null);
  const analysis = useMemo(() => analyzeSwatches(swatches), [swatches]);
  const activeSeason = selectedSeason ?? analysis?.bestSeason ?? 'autumn';
  const view = analysis ? getSeasonView(analysis, activeSeason) : null;
  const photo = usePhotoSwatches((nextSwatches) => {
    setSourceMode('photo');
    setSwatches(nextSwatches);
    setSelectedSeason(null);
  });
  const copySummary = view
    ? [
        `Season: ${view.seasonName}`,
        `Score: ${view.score}`,
        `Subtype: ${view.subtype.name}`,
        view.summary,
        `Guidance: ${view.guidance}`,
        `Avoid: ${view.avoidance}`,
      ].join('\n')
    : '';

  function applyBulkInput() {
    const parsed = parseBulkSwatches(bulkInput);
    if (parsed.length === 0) {
      setStatus('No usable HEX colors were found.');
      return;
    }
    setSourceMode('swatches');
    setSwatches(parsed);
    setSelectedSeason(null);
    setStatus(`Parsed ${parsed.length} color samples and grouped them from the surrounding labels.`);
  }

  function loadExample() {
    setBulkInput(seasonColorDefaults.bulkInput);
    setSourceMode('swatches');
    const parsed = parseBulkSwatches(seasonColorDefaults.bulkInput);
    setSwatches(parsed);
    setSelectedSeason(null);
    setStatus(`Parsed ${parsed.length} color samples and grouped them from the surrounding labels.`);
  }

  function loadQuickPalette(season: SeasonKey) {
    const palette = quickPalettes[season];
    setSourceMode('swatches');
    setSwatches(palette.map((hex) => ({ hex, group: 'reference' })));
    setManualColor(palette[0]);
    setSelectedSeason(season);
    setStatus(`Loaded the ${seasonData[season].name} quick sample.`);
  }

  function addManualColor() {
    const normalized = normalizeHex(manualColor);
    if (!normalized) {
      setStatus('Enter a valid HEX color.');
      return;
    }
    setSwatches((current) => [...current, { hex: normalized, group: 'manual' }]);
    setManualColor(normalized);
    setSelectedSeason(null);
    setStatus(`Added ${normalized}.`);
  }

  function clearAll() {
    setSwatches([]);
    setSelectedSeason(null);
    setStatus('All color samples have been cleared.');
  }

  function removeSwatch(index: number) {
    setSwatches((current) => current.filter((_, swatchIndex) => swatchIndex !== index));
  }

  return (
    <section className="tool-surface season-color-tool">
      <SegmentedTabs ariaLabel="Season color input source" options={sourceOptions} value={sourceMode} onChange={setSourceMode} />

      <div className="season-layout">
        <div className="season-input-column">
          {sourceMode === 'swatches' ? (
            <SwatchInputSection
              bulkInput={bulkInput}
              onAnalyze={applyBulkInput}
              onBulkInputChange={setBulkInput}
              onLoadSample={loadExample}
              onQuickPaletteSelect={loadQuickPalette}
              status={status}
            />
          ) : (
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
          )}

          <ManualColorSection manualColor={manualColor} onAdd={addManualColor} onManualColorChange={setManualColor} />

          <CurrentSamplesSection onClear={clearAll} onRemove={removeSwatch} swatches={swatches} />
        </div>

        <div className="season-result-column">
          {analysis && view ? (
            <SeasonResultContent
              activeSeason={activeSeason}
              analysis={analysis}
              copySummary={copySummary}
              onSeasonSelect={setSelectedSeason}
              sampleCount={swatches.length}
              view={view}
            />
          ) : (
            <EmptyState>Analyze swatches or choose a quick sample to generate your season palette.</EmptyState>
          )}
        </div>
      </div>
    </section>
  );
}

export { SeasonColorTool };
