import { useMemo, useState } from 'react';
import { Dices, RotateCcw, Shuffle } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { SelectField } from '../components/SelectField';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid, SplitTextAreas } from '../components/ToolLayout';
import type { ToolMetric } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import { readNumber } from '../utils/numberFormat';
import {
  formatGroups,
  formatNumberedList,
  makeGroups,
  parseList,
  randomizerDefaults,
  randomModeOptions,
  shuffleItems,
  type RandomMode,
} from './randomizer/randomizerUtils';

function RandomizerTool() {
  const [input, setInput] = useState(randomizerDefaults.input);
  const [output, setOutput] = useState(randomizerDefaults.output);
  const [mode, setMode] = useState<RandomMode>(randomizerDefaults.mode);
  const [pickCount, setPickCount] = useState(randomizerDefaults.pickCount);
  const [groupCount, setGroupCount] = useState(randomizerDefaults.groupCount);
  const items = useMemo(() => parseList(input), [input]);
  const metricsItems = useMemo<ToolMetric[]>(
    () => [
      { label: 'Items', value: items.length },
      { label: 'Mode', value: randomModeOptions.find((option) => option.value === mode)?.label ?? mode },
      { label: 'Pick count', value: pickCount },
      { label: 'Group count', value: groupCount },
    ],
    [groupCount, items.length, mode, pickCount],
  );

  function runRandomizer() {
    const shuffled = shuffleItems(items);

    if (mode === 'pick') {
      const count = Math.max(randomizerDefaults.minimumCount, Math.min(readNumber(pickCount, randomizerDefaults.minimumCount), shuffled.length));
      setOutput(formatNumberedList(shuffled.slice(0, count)));
      return;
    }

    if (mode === 'groups') {
      const groups = makeGroups(shuffled, readNumber(groupCount, randomizerDefaults.minimumCount));
      setOutput(formatGroups(groups));
      return;
    }

    setOutput(formatNumberedList(shuffled));
  }

  function resetSample() {
    setInput(randomizerDefaults.input);
    setOutput(randomizerDefaults.output);
    setMode(randomizerDefaults.mode);
    setPickCount(randomizerDefaults.pickCount);
    setGroupCount(randomizerDefaults.groupCount);
  }

  return (
    <section className="tool-surface">
      <ToolSection title="List">
        <SplitTextAreas left={{ label: 'Names or items', value: input, onChange: setInput }} right={{ label: 'Result', value: output, onChange: setOutput }} />
      </ToolSection>

      <ToolSection title="Randomize">
        <div className="inline-controls wide randomizer-controls">
          <SelectField label="Mode" value={mode} options={randomModeOptions} onChange={setMode} />
          <TextInputField label="Pick count" value={pickCount} onChange={setPickCount} compact />
          <TextInputField label="Group count" value={groupCount} onChange={setGroupCount} compact />
        </div>
        <ActionBar>
          <ToolbarButton title="Run randomizer" variant="primary" icon={<Dices size={16} />} label="Randomize" onClick={runRandomizer} disabled={items.length === 0} />
          <ToolbarButton title="Shuffle list" onClick={() => {
            setMode('shuffle');
            setOutput(formatNumberedList(shuffleItems(items)));
          }} icon={<Shuffle size={16} />} label="Quick shuffle" disabled={items.length === 0} />
          <ToolbarButton title="Reset sample" icon={<RotateCcw size={16} />} label="Sample" onClick={resetSample} />
          <CopyButton title="Copy randomizer result" value={output} />
        </ActionBar>
      </ToolSection>

      <MetricsGrid items={metricsItems} />
    </section>
  );
}

export { RandomizerTool };
