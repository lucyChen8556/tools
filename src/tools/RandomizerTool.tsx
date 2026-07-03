import { useMemo, useState } from 'react';
import { Dices, RotateCcw, Shuffle } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { SelectField } from '../components/SelectField';
import { TextInputField } from '../components/TextInputField';
import { ActionBar, MetricsGrid, SplitTextAreas } from '../components/ToolLayout';
import { ToolSection } from '../components/ToolSection';
import { ToolbarButton } from '../components/ToolbarButton';
import { readNumber } from '../utils/numberFormat';

const randomModeOptions = [
  { label: 'Pick winners', value: 'pick' },
  { label: 'Shuffle list', value: 'shuffle' },
  { label: 'Make groups', value: 'groups' },
] as const;

type RandomMode = (typeof randomModeOptions)[number]['value'];

function parseList(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function shuffleItems<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
  }
  return next;
}

function makeGroups(items: string[], groupCount: number) {
  const count = Math.max(1, Math.min(groupCount, items.length || 1));
  const groups = Array.from({ length: count }, () => [] as string[]);
  items.forEach((item, index) => {
    groups[index % count].push(item);
  });
  return groups;
}

function RandomizerTool() {
  const [input, setInput] = useState('Alice\nBen\nCasey\nDora\nEvan\nFiona\nGrace\nHank');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<RandomMode>('pick');
  const [pickCount, setPickCount] = useState('2');
  const [groupCount, setGroupCount] = useState('3');
  const items = useMemo(() => parseList(input), [input]);

  function runRandomizer() {
    const shuffled = shuffleItems(items);

    if (mode === 'pick') {
      const count = Math.max(1, Math.min(readNumber(pickCount, 1), shuffled.length));
      setOutput(shuffled.slice(0, count).map((item, index) => `${index + 1}. ${item}`).join('\n'));
      return;
    }

    if (mode === 'groups') {
      const groups = makeGroups(shuffled, readNumber(groupCount, 1));
      setOutput(groups.map((group, index) => [`Group ${index + 1}`, ...group.map((item) => `- ${item}`)].join('\n')).join('\n\n'));
      return;
    }

    setOutput(shuffled.map((item, index) => `${index + 1}. ${item}`).join('\n'));
  }

  function resetSample() {
    setInput('Alice\nBen\nCasey\nDora\nEvan\nFiona\nGrace\nHank');
    setOutput('');
    setMode('pick');
    setPickCount('2');
    setGroupCount('3');
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
          <ToolbarButton title="Run randomizer" variant="primary" onClick={runRandomizer} disabled={items.length === 0}>
            <Dices size={16} />
            <span>Randomize</span>
          </ToolbarButton>
          <ToolbarButton title="Shuffle list" onClick={() => {
            setMode('shuffle');
            setOutput(shuffleItems(items).map((item, index) => `${index + 1}. ${item}`).join('\n'));
          }} disabled={items.length === 0}>
            <Shuffle size={16} />
            <span>Quick shuffle</span>
          </ToolbarButton>
          <ToolbarButton title="Reset sample" onClick={resetSample}>
            <RotateCcw size={16} />
            <span>Sample</span>
          </ToolbarButton>
          <CopyButton title="Copy randomizer result" value={output} />
        </ActionBar>
      </ToolSection>

      <MetricsGrid
        items={[
          { label: 'Items', value: items.length },
          { label: 'Mode', value: randomModeOptions.find((option) => option.value === mode)?.label ?? mode },
          { label: 'Pick count', value: pickCount },
          { label: 'Group count', value: groupCount },
        ]}
      />
    </section>
  );
}

export { RandomizerTool };
