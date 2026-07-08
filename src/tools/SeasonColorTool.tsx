import { useMemo, useState } from 'react';
import { ImageUp, Plus, RotateCcw, Sparkles, Trash2 } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { SelectField } from '../components/SelectField';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { TextAreaField } from '../components/TextAreaField';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import { groupMeta, paletteCategories, photoEditableGroups, quickPalettes, seasonColorDefaults, seasonData } from './seasonColor/seasonColorData';
import {
  analyzeSwatches,
  buildHeroPattern,
  describeChroma,
  describeLightness,
  describeWarmth,
  getSeasonView,
  groupPaletteByCategory,
  normalizeHex,
  parseBulkSwatches,
  seasonKeys,
} from './seasonColor/seasonColorUtils';
import type { ColorGroup, PaletteSwatch, SeasonKey, SeasonSwatch } from './seasonColor/seasonColorTypes';
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
  const [swatches, setSwatches] = useState<SeasonSwatch[]>(() => parseBulkSwatches(seasonColorDefaults.bulkInput));
  const [selectedSeason, setSelectedSeason] = useState<SeasonKey | null>(null);
  const analysis = useMemo(() => analyzeSwatches(swatches), [swatches]);
  const activeSeason = selectedSeason ?? analysis?.bestSeason ?? 'autumn';
  const view = analysis ? getSeasonView(analysis, activeSeason) : null;
  const photo = usePhotoSwatches((nextSwatches) => {
    setSourceMode('photo');
    setSwatches(nextSwatches);
    setSelectedSeason(null);
  });
  const metricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Samples', value: swatches.length },
      { label: 'Best season', value: analysis ? seasonData[analysis.bestSeason].name : '-' },
      { label: 'Active season', value: seasonData[activeSeason].name },
      { label: 'Subtype', value: view?.subtype.name ?? '-' },
    ],
    [activeSeason, analysis, swatches.length, view?.subtype.name],
  );
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
      setStatus('沒有找到可用的 HEX 色碼。');
      return;
    }
    setSourceMode('swatches');
    setSwatches(parsed);
    setSelectedSeason(null);
    setStatus(`已整理 ${parsed.length} 個色票，並依文字標籤完成分類。`);
  }

  function loadExample() {
    setBulkInput(seasonColorDefaults.bulkInput);
    setSourceMode('swatches');
    const parsed = parseBulkSwatches(seasonColorDefaults.bulkInput);
    setSwatches(parsed);
    setSelectedSeason(null);
    setStatus(`已整理 ${parsed.length} 個色票，並依文字標籤完成分類。`);
  }

  function loadQuickPalette(season: SeasonKey) {
    const palette = quickPalettes[season];
    setSourceMode('swatches');
    setSwatches(palette.map((hex) => ({ hex, group: 'reference' })));
    setManualColor(palette[0]);
    setSelectedSeason(season);
    setStatus(`已載入 ${seasonData[season].name} 快速範例。`);
  }

  function addManualColor() {
    const normalized = normalizeHex(manualColor);
    if (!normalized) {
      setStatus('請輸入有效 HEX 色碼。');
      return;
    }
    setSwatches((current) => [...current, { hex: normalized, group: 'manual' }]);
    setManualColor(normalized);
    setSelectedSeason(null);
    setStatus(`已加入 ${normalized}。`);
  }

  function clearAll() {
    setSwatches([]);
    setSelectedSeason(null);
    setStatus('已清空色票。');
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
            <ToolSection title="Swatch input">
              <TextAreaField label="Paste swatches" value={bulkInput} onChange={setBulkInput} spellCheck={false} />
              <ActionBar>
                <ToolbarButton title="Parse swatches and analyze" variant="primary" onClick={applyBulkInput}>
                  <Sparkles size={16} />
                  <span>Analyze</span>
                </ToolbarButton>
                <ToolbarButton title="Load sample swatches" onClick={loadExample}>
                  <RotateCcw size={16} />
                  <span>Sample</span>
                </ToolbarButton>
              </ActionBar>
              <p className="season-hint">{status}</p>
              <div className="season-quick-grid">
                {seasonKeys.map((season) => (
                  <button key={season} type="button" onClick={() => loadQuickPalette(season)}>
                    <span>{seasonData[season].name}</span>
                    <i>{quickPalettes[season].map((hex) => <b key={hex} style={{ background: hex }} />)}</i>
                  </button>
                ))}
              </div>
            </ToolSection>
          ) : (
            <ToolSection title="Photo extraction">
              <label className="season-photo-drop">
                <input type="file" accept="image/*" onChange={(event) => photo.loadPhoto(event.target.files?.[0] ?? null)} />
                {photo.photoUrl ? <img src={photo.photoUrl} alt="Uploaded color reference" /> : <span><ImageUp size={18} /> Upload image</span>}
              </label>
              <p className="season-hint">{photo.photoStatus}</p>
              <PhotoSwatchEditor swatches={photo.photoSwatches} onChange={photo.updatePhotoGroup} />
              <ActionBar>
                <ToolbarButton title="Use extracted photo swatches" variant="primary" disabled={photo.loading || photo.photoSwatches.length === 0} onClick={photo.applyPhotoSwatches}>
                  <Sparkles size={16} />
                  <span>Use photo colors</span>
                </ToolbarButton>
                <ToolbarButton title="Clear photo" onClick={photo.clearPhoto}>
                  <Trash2 size={16} />
                  <span>Clear photo</span>
                </ToolbarButton>
              </ActionBar>
            </ToolSection>
          )}

          <ToolSection title="Manual color">
            <div className="season-color-entry">
              <input className="color-picker" type="color" value={normalizeHex(manualColor) ?? seasonColorDefaults.color} onChange={(event) => setManualColor(event.target.value)} title="Pick color" />
              <TextInputField label="HEX" value={manualColor} onChange={setManualColor} compact />
              <ToolbarButton title="Add manual color" variant="primary" onClick={addManualColor}>
                <Plus size={16} />
                <span>Add</span>
              </ToolbarButton>
            </div>
          </ToolSection>

          <ToolSection title="Current samples">
            <SampleList swatches={swatches} onRemove={removeSwatch} />
            <ActionBar>
              <ToolbarButton title="Clear all colors" onClick={clearAll} disabled={swatches.length === 0}>
                <Trash2 size={16} />
                <span>Clear all</span>
              </ToolbarButton>
            </ActionBar>
          </ToolSection>
        </div>

        <div className="season-result-column">
          <div className="season-hero" style={{ backgroundImage: `linear-gradient(rgba(24,25,28,.28), rgba(24,25,28,.55)), ${view?.heroPattern ?? buildHeroPattern(['#F7C65D', '#87A8C7', '#9A5D3B', '#1F2937', '#F5F0E8'])}` }}>
            <div>
              <p>Analysis result</p>
              <h3>{view ? view.seasonName : '加入顏色開始分析'}</h3>
              <span>{view?.summary ?? '貼上含有分類與 HEX 的色票，工具會整理出冷暖、明度、彩度、對比與四季類型。'}</span>
            </div>
            <strong>{view?.score ?? '--'}</strong>
          </div>

          <div className="season-tabs">
            {seasonKeys.map((season) => (
              <button className={activeSeason === season ? 'active' : ''} key={season} type="button" disabled={!analysis} onClick={() => setSelectedSeason(season)}>
                {seasonData[season].name.replace(/季$/, '')}
              </button>
            ))}
          </div>

          {analysis && view ? (
            <>
              <ToolSection title="Subtype">
                <div className="season-subtype">
                  <div>
                    <h4>{`${view.subtype.name} · ${Math.round(view.subtype.score)}`}</h4>
                    <p>{view.subtype.summary}</p>
                  </div>
                  <div className="season-pill-list">
                    {view.subtype.traits.map((trait) => <span key={trait}>{trait}</span>)}
                    {view.subtypeScores.map((subtype) => <span key={subtype.key}>{`${subtype.name.replace(/ .+$/, '')} ${Math.round(subtype.score)}`}</span>)}
                  </div>
                </div>
                {view.boundary ? (
                  <div className="season-boundary">
                    <strong>{`${view.boundary.primarySubtype.name} · 鄰近 ${view.boundary.neighborSubtype.name}`}</strong>
                    <p>{`主季節 ${view.boundary.primarySeasonName} 仍是核心，但 ${view.boundary.neighborSeasonName} 分數很近。`}</p>
                  </div>
                ) : null}
              </ToolSection>

              <MetricsGrid items={metricsItems} />

              <div className="season-analysis-grid">
                <ToolSection title="Color tendency">
                  <div className="season-metrics">
                    {view.metricRows.map((metric) => (
                      <div className="season-metric-row" key={metric.label}>
                        <div><strong>{metric.label}</strong><span>{metric.detail}</span></div>
                        <i><b style={{ width: `${Math.round(metric.value * 100)}%`, background: metric.bar }} /></i>
                        <small>{`${metric.left} -> ${metric.right}`}</small>
                      </div>
                    ))}
                  </div>
                </ToolSection>

                <ToolSection title="Season ranking">
                  <div className="season-ranking">
                    {analysis.scores.map((score) => (
                      <div key={score.key}>
                        <span>{seasonData[score.key].name}</span>
                        <i><b style={{ width: `${score.score}%` }} /></i>
                        <strong>{score.score}</strong>
                      </div>
                    ))}
                  </div>
                </ToolSection>
              </div>

              <ToolSection title="Personal color groups">
                <div className="season-group-grid">
                  {analysis.groups.map((group) => (
                    <div className="season-group-card" key={group.key}>
                      <div><strong>{group.label}</strong><span>{group.count} 色</span></div>
                      <p>{`${describeWarmth(group.warmth)}、${describeLightness(group.lightness)}、${describeChroma(group.chroma)}`}</p>
                      <MiniSwatches colors={group.colors} />
                    </div>
                  ))}
                </div>
              </ToolSection>

              <ToolSection title="Suitable palette">
                <CategorizedPalette swatches={view.palette} />
              </ToolSection>

              <ToolSection title="Style guidance">
                <div className="season-guidance">
                  <p>{view.guidance}</p>
                  <div><strong>避免</strong><span>{view.avoidance}</span></div>
                </div>
                <ActionBar>
                  <CopyButton title="Copy season color summary" value={copySummary} label="Copy summary" />
                </ActionBar>
              </ToolSection>

              <ToolSection title="Avoid palette">
                <div className="season-palette-grid avoid">
                  {view.avoidPalette.map((swatch) => <SwatchCard key={`${swatch.name}-${swatch.hex}`} swatch={swatch} />)}
                </div>
              </ToolSection>
            </>
          ) : (
            <div className="empty-state">Add color samples to start the season analysis.</div>
          )}
        </div>
      </div>
    </section>
  );
}

function SampleList({ swatches, onRemove }: { swatches: SeasonSwatch[]; onRemove: (index: number) => void }) {
  if (swatches.length === 0) return <div className="empty-state compact">No colors yet</div>;
  return (
    <div className="season-sample-list">
      {swatches.map((swatch, index) => (
        <div className="season-sample-chip" key={`${swatch.hex}-${index}`}>
          <span style={{ background: swatch.hex }} />
          <div><code>{swatch.hex}</code><small>{groupMeta[swatch.group]?.label ?? '未分類'}</small></div>
          <button type="button" title={`Remove ${swatch.hex}`} onClick={() => onRemove(index)}><Trash2 size={14} /></button>
        </div>
      ))}
    </div>
  );
}

function PhotoSwatchEditor({ swatches, onChange }: { swatches: SeasonSwatch[]; onChange: (index: number, group: ColorGroup) => void }) {
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

function CategorizedPalette({ swatches }: { swatches: PaletteSwatch[] }) {
  const groups = groupPaletteByCategory(swatches);
  return (
    <div className="season-category-list">
      {groups.map((category) => (
        <section key={category.key}>
          <div className="season-category-heading">
            <div><strong>{category.label}</strong><p>{category.note}</p></div>
            <span>{category.swatches.length} 色</span>
          </div>
          <div className="season-palette-grid">
            {category.swatches.map((swatch) => <SwatchCard key={`${swatch.name}-${swatch.hex}`} swatch={swatch} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function SwatchCard({ swatch }: { swatch: PaletteSwatch }) {
  return (
    <div className="season-swatch-card">
      <span style={{ background: swatch.hex }} />
      <strong>{swatch.name}</strong>
      <code>{swatch.hex}</code>
    </div>
  );
}

function MiniSwatches({ colors }: { colors: string[] }) {
  return <div className="season-mini-swatches">{colors.map((hex) => <span key={hex} style={{ background: hex }} title={hex} />)}</div>;
}

export { SeasonColorTool };
