export type ToolId =
  | 'json'
  | 'text-diff'
  | 'markdown-table'
  | 'text-cleaner'
  | 'time'
  | 'text'
  | 'image'
  | 'color'
  | 'regex'
  | 'jwt'
  | 'hash'
  | 'url'
  | 'number'
  | 'css-unit'
  | 'expense'
  | 'discount'
  | 'invoice'
  | 'subscription'
  | 'randomizer'
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

export type RegexCaptureGroup = {
  name?: string;
  text: string;
  index: number;
  end: number;
};

export type RegexMatchResult = {
  text: string;
  index: number;
  end: number;
  groups: RegexCaptureGroup[];
};

export type HighlightSegment = {
  type: 'text' | 'match';
  text: string;
  index?: number;
};
