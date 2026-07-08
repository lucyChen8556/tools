import { quickPalettes, seasonData } from '../seasonColorData';
import { seasonKeys } from '../seasonColorUtils';
import type { SeasonKey } from '../seasonColorTypes';

type QuickPaletteGridProps = {
  onSelect: (season: SeasonKey) => void;
};

function QuickPaletteGrid({ onSelect }: QuickPaletteGridProps) {
  return (
    <div className="season-quick-grid">
      {seasonKeys.map((season) => (
        <button key={season} type="button" onClick={() => onSelect(season)}>
          <span>{seasonData[season].name}</span>
          <i>{quickPalettes[season].map((hex) => <b key={hex} style={{ background: hex }} />)}</i>
        </button>
      ))}
    </div>
  );
}

export { QuickPaletteGrid };
