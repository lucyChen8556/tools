import { ToolSection } from '@/components/ToolSection';
import type { getSeasonView } from '../seasonColorUtils';

type SeasonView = ReturnType<typeof getSeasonView>;

type ColorTendencySectionProps = {
  view: SeasonView;
};

function ColorTendencySection({ view }: ColorTendencySectionProps) {
  return (
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
  );
}

export { ColorTendencySection };
