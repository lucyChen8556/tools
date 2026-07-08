import type { PaletteSwatch } from '../seasonColorTypes';

type SwatchCardProps = {
  swatch: PaletteSwatch;
};

function SwatchCard({ swatch }: SwatchCardProps) {
  return (
    <div className="season-swatch-card">
      <span style={{ background: swatch.hex }} />
      <strong>{swatch.name}</strong>
      <code>{swatch.hex}</code>
    </div>
  );
}

export { SwatchCard };
