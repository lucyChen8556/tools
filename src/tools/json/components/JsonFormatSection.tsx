import { FileJson } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { SegmentedTabs } from '@/components/SegmentedTabs';
import { TextAreaField } from '@/components/TextAreaField';
import { ActionBar, SplitTextAreas } from '@/components/ToolLayout';
import { ToolbarButton } from '@/components/ToolbarButton';
import { formatTargetOptions, type JsonFormatTarget } from '../constants';
import type { JsonCompareState } from './JsonCompareSection';

type JsonFormatSectionProps = {
  compareState: JsonCompareState;
  formatTarget: JsonFormatTarget;
  jsonResult: string;
  onFormat: (target: JsonFormatTarget) => void;
  onFormatTargetChange: (value: JsonFormatTarget) => void;
  onJsonResultChange: (value: string) => void;
};

function JsonFormatSection({
  compareState,
  formatTarget,
  jsonResult,
  onFormat,
  onFormatTargetChange,
  onJsonResultChange,
}: JsonFormatSectionProps) {
  return (
    <>
      <ActionBar>
        <SegmentedTabs compact ariaLabel="Format target" options={formatTargetOptions} value={formatTarget} onChange={onFormatTargetChange} />
        <ToolbarButton title="Format selected JSON" variant="primary" icon={<FileJson size={16} />} label="Format" onClick={() => onFormat(formatTarget)} />
        <CopyButton title="Copy result" value={jsonResult} />
      </ActionBar>

      {jsonResult ? (
        <TextAreaField label="Result" value={jsonResult} onChange={onJsonResultChange} spellCheck={false} className="result-output" />
      ) : (
        <SplitTextAreas
          compact
          left={{ label: 'Sorted Before', value: compareState.leftSorted, readOnly: true, spellCheck: false }}
          right={{ label: 'Sorted After', value: compareState.rightSorted, readOnly: true, spellCheck: false }}
        />
      )}
    </>
  );
}

export { JsonFormatSection };
