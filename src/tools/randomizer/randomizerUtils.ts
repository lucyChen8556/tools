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

function formatNumberedList(items: string[]) {
  return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
}

function formatGroups(groups: string[][]) {
  return groups.map((group, index) => [`Group ${index + 1}`, ...group.map((item) => `- ${item}`)].join('\n')).join('\n\n');
}

export { formatGroups, formatNumberedList, makeGroups, parseList, randomModeOptions, shuffleItems };
export type { RandomMode };
