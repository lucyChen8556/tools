export type HighlightSegment =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'match';
      text: string;
      index: number;
    };

export type RegexRule = {
  id: string;
  text: string;
  label: string;
  description: string;
  details: string[];
  start: number;
  end: number;
  tone: number;
};
