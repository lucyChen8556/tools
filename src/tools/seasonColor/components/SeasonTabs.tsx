import { seasonKeys } from '../seasonColorUtils';
import type { SeasonKey } from '../seasonColorTypes';

type SeasonTabsProps = {
  activeSeason: SeasonKey;
  onSelect: (season: SeasonKey) => void;
};

function SeasonTabs({ activeSeason, onSelect }: SeasonTabsProps) {
  return (
    <div className="season-tabs">
      {seasonKeys.map((season) => (
        <button className={activeSeason === season ? 'active' : ''} key={season} type="button" onClick={() => onSelect(season)}>
          {season[0].toUpperCase() + season.slice(1)}
        </button>
      ))}
    </div>
  );
}

export { SeasonTabs };
