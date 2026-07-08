import { readNumber } from '../../utils/numberFormat';

type Participant = {
  id: string;
  name: string;
  shares: string;
};

const defaultParticipants: Participant[] = [
  { id: 'alice', name: 'Alice', shares: '1' },
  { id: 'ben', name: 'Ben', shares: '1' },
  { id: 'casey', name: 'Casey', shares: '1.5' },
];

const splitModeOptions = [
  { label: 'Quick', value: 'quick' },
  { label: 'Detailed', value: 'detailed' },
] as const;

type SplitMode = (typeof splitModeOptions)[number]['value'];

const expenseDefaults = {
  mode: 'quick' as SplitMode,
  quickTotal: '1500',
  quickPeople: '4',
  amount: '1280',
  taxPercent: '5',
  tipPercent: '10',
  extraFee: '0',
  currency: '$',
  minimumPeople: 1,
};

function calculateQuickSplit(totalInput: string, peopleInput: string) {
  const total = Math.max(0, readNumber(totalInput));
  const people = Math.max(expenseDefaults.minimumPeople, Math.floor(readNumber(peopleInput, expenseDefaults.minimumPeople)));
  const each = total / people;
  return { total, people, each };
}

function calculateDetailedSplit(input: {
  amount: string;
  taxPercent: string;
  tipPercent: string;
  extraFee: string;
  participants: Participant[];
}) {
  const baseAmount = Math.max(0, readNumber(input.amount));
  const tax = baseAmount * (Math.max(0, readNumber(input.taxPercent)) / 100);
  const tip = baseAmount * (Math.max(0, readNumber(input.tipPercent)) / 100);
  const extra = Math.max(0, readNumber(input.extraFee));
  const total = baseAmount + tax + tip + extra;
  const rows = input.participants.map((participant) => ({
    ...participant,
    numericShares: Math.max(0, readNumber(participant.shares)),
  }));
  const totalShares = rows.reduce((sum, participant) => sum + participant.numericShares, 0);
  const perShare = totalShares > 0 ? total / totalShares : 0;

  return {
    baseAmount,
    tax,
    tip,
    extra,
    total,
    totalShares,
    perShare,
    rows: rows.map((participant) => ({
      ...participant,
      amount: participant.numericShares * perShare,
    })),
  };
}

export { calculateDetailedSplit, calculateQuickSplit, defaultParticipants, expenseDefaults, splitModeOptions };
export type { Participant, SplitMode };
