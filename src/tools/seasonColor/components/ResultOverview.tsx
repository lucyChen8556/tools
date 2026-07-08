import { seasonData } from '../seasonColorData';
import type { getSeasonView } from '../seasonColorUtils';
import type { SeasonAnalysis, SeasonKey } from '../seasonColorTypes';

type SeasonView = ReturnType<typeof getSeasonView>;

type ResultOverviewProps = {
  activeSeason: SeasonKey;
  analysis: SeasonAnalysis;
  sampleCount: number;
  view: SeasonView;
};

function ResultOverview({ activeSeason, analysis, sampleCount, view }: ResultOverviewProps) {
  const score = view.score;
  const accentColors = view.season.hero ?? seasonData[activeSeason].hero;
  const stats = [
    { label: 'Samples', value: sampleCount },
    { label: 'Best match', value: seasonData[analysis.bestSeason].name },
    { label: 'Viewing', value: seasonData[activeSeason].name },
    { label: 'Subtype', value: view.subtype.name },
  ];

  return (
    <section className="season-hero">
      <div className="season-hero-accent" aria-hidden="true">
        {accentColors.map((color) => <span key={color} style={{ background: color }} />)}
      </div>

      <div className="season-hero-copy">
        <p>Analysis result</p>
        <h3>{view.seasonName}</h3>
        <span>{view.summary}</span>
      </div>

      <div className="season-score-panel">
        <span>Season score</span>
        <strong>{score}</strong>
        <small>{`${score}/100 match confidence`}</small>
        <i><b style={{ width: `${score}%` }} /></i>
      </div>

      <div className="season-result-stats">
        {stats.map((stat) => (
          <div key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export { ResultOverview };
