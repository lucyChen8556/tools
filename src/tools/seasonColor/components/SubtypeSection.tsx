import { ToolSection } from '../../../components/ToolSection';
import type { getSeasonView } from '../seasonColorUtils';

type SeasonView = ReturnType<typeof getSeasonView>;

type SubtypeSectionProps = {
  view: SeasonView;
};

function SubtypeSection({ view }: SubtypeSectionProps) {
  return (
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
          <strong>{`${view.boundary.primarySubtype.name} · Near ${view.boundary.neighborSubtype.name}`}</strong>
          <p>{`${view.boundary.primarySeasonName} remains the core season, but ${view.boundary.neighborSeasonName} is close.`}</p>
        </div>
      ) : null}
    </ToolSection>
  );
}

export { SubtypeSection };
