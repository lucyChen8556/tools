import { groupPaletteByCategory } from '../seasonColorUtils';
import type { PaletteSwatch } from '../seasonColorTypes';
import { SwatchCard } from './SwatchCard';

type CategorizedPaletteProps = {
  swatches: PaletteSwatch[];
};

function CategorizedPalette({ swatches }: CategorizedPaletteProps) {
  const groups = groupPaletteByCategory(swatches);

  return (
    <div className="season-category-list">
      {groups.map((category) => (
        <section key={category.key}>
          <div className="season-category-heading">
            <div><strong>{category.label}</strong><p>{category.note}</p></div>
            <span>{`${category.swatches.length} colors`}</span>
          </div>
          <div className="season-palette-grid">
            {category.swatches.map((swatch) => <SwatchCard key={`${swatch.name}-${swatch.hex}`} swatch={swatch} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

export { CategorizedPalette };
