type JsonToolMode = 'compare' | 'format';
type JsonFormatTarget = 'left' | 'right';

const sampleLeftJson = `{
  "dashboard": {
    "title": "Order Center",
    "status": "Draft"
  },
  "version": 1
}`;

const sampleRightJson = `{
  "dashboard": {
    "title": "Order Center",
    "status": "Published",
    "owner": "Ops"
  },
  "version": 2
}`;

const jsonModeOptions = [
  { label: 'Compare', value: 'compare' },
  { label: 'Format', value: 'format' },
] as const;

const formatTargetOptions = [
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
] as const;

export { formatTargetOptions, jsonModeOptions, sampleLeftJson, sampleRightJson };
export type { JsonFormatTarget, JsonToolMode };
