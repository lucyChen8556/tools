import { ToolSection } from '@/components/ToolSection';
import { seasonData } from '../seasonColorData';
import type { SeasonAnalysis } from '../seasonColorTypes';

type SeasonRankingSectionProps = {
  analysis: SeasonAnalysis;
};

function SeasonRankingSection({ analysis }: SeasonRankingSectionProps) {
  return (
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
  );
}

export { SeasonRankingSection };
