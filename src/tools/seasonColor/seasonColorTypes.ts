type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter';

type ColorGroup = 'skin' | 'eyes' | 'sclera' | 'hair' | 'brows' | 'lips' | 'manual' | 'reference' | 'unknown';

type SeasonProfile = {
  warmth: number;
  lightness: number;
  chroma: number;
  contrast: number;
  depth: number;
};

type SeasonSwatch = {
  hex: string;
  group: ColorGroup;
};

type PaletteCategory = 'neutral' | 'main' | 'accent' | 'lip' | 'deep';

type PaletteSwatch = {
  name: string;
  hex: string;
  category: PaletteCategory;
};

type SeasonAnalysis = {
  features: Array<
    SeasonSwatch & {
      warmth: number;
      lightness: number;
      chroma: number;
      depth: number;
      luminance: number;
      weight: number;
    }
  >;
  groups: Array<{
    key: ColorGroup;
    label: string;
    count: number;
    warmth: number;
    lightness: number;
    chroma: number;
    contrast: number;
    colors: string[];
  }>;
  metrics: SeasonProfile & {
    deepContrast: number;
    darkDepth: number;
  };
  scores: Array<{ key: SeasonKey; score: number }>;
  bestSeason: SeasonKey;
};

type Subtype = {
  key: string;
  name: string;
  summary: string;
  profile: SeasonProfile;
  traits: string[];
};

type BoundaryResult = {
  gap: number;
  strength: string;
  primarySeasonKey: SeasonKey;
  primarySeasonName: string;
  primarySeasonScore: number;
  primarySubtype: Subtype & { score: number };
  neighborSeasonKey: SeasonKey;
  neighborSeasonName: string;
  neighborSeasonScore: number;
  neighborSubtype: Subtype & { score: number };
};

export type { BoundaryResult, ColorGroup, PaletteCategory, PaletteSwatch, SeasonAnalysis, SeasonKey, SeasonProfile, SeasonSwatch, Subtype };
