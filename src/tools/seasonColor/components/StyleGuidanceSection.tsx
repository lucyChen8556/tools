import { CopyButton } from '../../../components/CopyButton';
import { ActionBar } from '../../../components/ToolLayout';
import { ToolSection } from '../../../components/ToolSection';

type StyleGuidanceSectionProps = {
  avoidance: string;
  copySummary: string;
  guidance: string;
};

function StyleGuidanceSection({ avoidance, copySummary, guidance }: StyleGuidanceSectionProps) {
  return (
    <ToolSection title="Style guidance">
      <div className="season-guidance">
        <p>{guidance}</p>
        <div><strong>Avoid</strong><span>{avoidance}</span></div>
      </div>
      <ActionBar>
        <CopyButton title="Copy season color summary" value={copySummary} label="Copy summary" />
      </ActionBar>
    </ToolSection>
  );
}

export { StyleGuidanceSection };
