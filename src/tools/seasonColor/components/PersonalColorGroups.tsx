import { describeChroma, describeLightness, describeWarmth } from '../seasonColorUtils';
import type { SeasonAnalysis } from '../seasonColorTypes';
import { MiniSwatches } from './MiniSwatches';

type PersonalColorGroupsProps = {
  groups: SeasonAnalysis['groups'];
};

function PersonalColorGroups({ groups }: PersonalColorGroupsProps) {
  return (
    <div className="season-group-grid">
      {groups.map((group) => (
        <div className="season-group-card" key={group.key}>
          <div><strong>{group.label}</strong><span>{`${group.count} colors`}</span></div>
          <p>{`${describeWarmth(group.warmth)}, ${describeLightness(group.lightness)}, ${describeChroma(group.chroma)}`}</p>
          <MiniSwatches colors={group.colors} />
        </div>
      ))}
    </div>
  );
}

export { PersonalColorGroups };
