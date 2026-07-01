export type ToolId =
  | 'json'
  | 'text-diff'
  | 'text-cleaner'
  | 'time'
  | 'text'
  | 'image'
  | 'color'
  | 'regex'
  | 'jwt'
  | 'encode'
  | 'csv';

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export type JsonDiff = {
  path: Array<string | number>;
  type: 'added' | 'removed' | 'changed' | 'type' | 'array-length';
  before?: JsonValue;
  after?: JsonValue;
};

export type JsonMergeMode = 'full' | 'diff' | 'value';

export type DiffOp = {
  type: 'same' | 'added' | 'removed' | 'changed';
  oldText?: string;
  newText?: string;
};

export type RegexMatchResult = {
  text: string;
  index: number;
  groups: string[];
};

export type HighlightSegment = {
  type: 'text' | 'match';
  text: string;
  index?: number;
};
