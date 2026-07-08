type MiniSwatchesProps = {
  colors: string[];
};

function MiniSwatches({ colors }: MiniSwatchesProps) {
  return <div className="season-mini-swatches">{colors.map((hex) => <span key={hex} style={{ background: hex }} title={hex} />)}</div>;
}

export { MiniSwatches };
