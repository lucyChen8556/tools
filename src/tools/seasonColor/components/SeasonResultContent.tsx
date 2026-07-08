import { ToolSection } from '../../../components/ToolSection';
import type { getSeasonView } from '../seasonColorUtils';
import type { SeasonAnalysis, SeasonKey } from '../seasonColorTypes';
import { CategorizedPalette } from './CategorizedPalette';
import { ColorTendencySection } from './ColorTendencySection';
import { PersonalColorGroups } from './PersonalColorGroups';
import { ResultOverview } from './ResultOverview';
import { SeasonRankingSection } from './SeasonRankingSection';
import { SeasonTabs } from './SeasonTabs';
import { StyleGuidanceSection } from './StyleGuidanceSection';
import { SubtypeSection } from './SubtypeSection';
import { SwatchCard } from './SwatchCard';

type SeasonView = ReturnType<typeof getSeasonView>;

type SeasonResultContentProps = {
  activeSeason: SeasonKey;
  analysis: SeasonAnalysis;
  copySummary: string;
  onSeasonSelect: (season: SeasonKey) => void;
  sampleCount: number;
  view: SeasonView;
};

function SeasonResultContent({
  activeSeason,
  analysis,
  copySummary,
  onSeasonSelect,
  sampleCount,
  view,
}: SeasonResultContentProps) {
  return (
    <>
      <ResultOverview activeSeason={activeSeason} analysis={analysis} sampleCount={sampleCount} view={view} />

      <SeasonTabs activeSeason={activeSeason} onSelect={onSeasonSelect} />

      <SubtypeSection view={view} />

      <div className="season-analysis-grid">
        <ColorTendencySection view={view} />
        <SeasonRankingSection analysis={analysis} />
      </div>

      <ToolSection title="Personal color groups">
        <PersonalColorGroups groups={analysis.groups} />
      </ToolSection>

      <ToolSection title="Suitable palette">
        <CategorizedPalette swatches={view.palette} />
      </ToolSection>

      <StyleGuidanceSection avoidance={view.avoidance} copySummary={copySummary} guidance={view.guidance} />

      <ToolSection title="Avoid palette">
        <div className="season-palette-grid avoid">
          {view.avoidPalette.map((swatch) => <SwatchCard key={`${swatch.name}-${swatch.hex}`} swatch={swatch} />)}
        </div>
      </ToolSection>
    </>
  );
}

export { SeasonResultContent };
