import { groupMeta, paletteCategories, seasonData, seasonSubtypes } from './seasonColorData';
import type { BoundaryResult, ColorGroup, PaletteCategory, PaletteSwatch, SeasonAnalysis, SeasonKey, SeasonProfile, SeasonSwatch, Subtype } from './seasonColorTypes';

type Rgb = { r: number; g: number; b: number };
type Hsl = { h: number; s: number; l: number };

const seasonKeys = Object.keys(seasonData) as SeasonKey[];

function normalizeHex(value: string) {
  const trimmed = value.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed
      .split('')
      .map((character) => character + character)
      .join('')
      .toUpperCase()}`;
  }
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed.toUpperCase()}`;
  return null;
}

function parseBulkSwatches(text: string) {
  const swatches: SeasonSwatch[] = [];
  const hexPattern = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/g;
  let currentGroup: ColorGroup = 'unknown';
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = hexPattern.exec(text)) !== null) {
    const detectedGroup = detectGroup(text.slice(cursor, match.index));
    if (detectedGroup) currentGroup = detectedGroup;
    const hex = normalizeHex(match[0]);
    if (hex) swatches.push({ hex, group: currentGroup });
    cursor = match.index + match[0].length;
  }

  return swatches;
}

function detectGroup(fragment: string): ColorGroup | null {
  const text = fragment.toLowerCase();
  if (/眼白|sclera|white/.test(text)) return 'sclera';
  if (/皮膚|膚色|skin|face/.test(text)) return 'skin';
  if (/眼睛|瞳孔|虹膜|eyes|iris/.test(text)) return 'eyes';
  if (/頭髮|髮色|hair/.test(text)) return 'hair';
  if (/眉毛|眉|brow/.test(text)) return 'brows';
  if (/嘴巴|嘴唇|唇|lip|mouth/.test(text)) return 'lips';
  return null;
}

function hexToRgb(hex: string): Rgb {
  const value = normalizeHex(hex) ?? '#000000';
  const numeric = Number.parseInt(value.slice(1), 16);
  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  };
}

function rgbToHex({ r, g, b }: Rgb) {
  return `#${[r, g, b].map((channel) => clamp(Math.round(channel), 0, 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) return { h: 0, s: 0, l: lightness };

  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;
  if (max === red) hue = (green - blue) / delta + (green < blue ? 6 : 0);
  else if (max === green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;
  return { h: hue * 60, s: saturation, l: lightness };
}

function relativeLuminance({ r, g, b }: Rgb) {
  const channels = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function getWarmth({ h, s }: Hsl) {
  const warmDistance = hueDistance(h, 48);
  const coolDistance = hueDistance(h, 222);
  const hueWarmth = coolDistance / (warmDistance + coolDistance);
  return clamp(hueWarmth * (0.7 + s * 0.3), 0, 1);
}

function hueDistance(a: number, b: number) {
  const distance = Math.abs(a - b) % 360;
  return Math.min(distance, 360 - distance);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function average(numbers: number[]) {
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function weightedAverage<T extends { weight: number }>(items: T[], key: keyof T) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  return items.reduce((sum, item) => sum + Number(item[key]) * item.weight, 0) / totalWeight;
}

function analyzeSwatches(swatches: SeasonSwatch[]): SeasonAnalysis | null {
  if (swatches.length === 0) return null;

  const features = swatches.map((swatch) => {
    const rgb = hexToRgb(swatch.hex);
    const hsl = rgbToHsl(rgb);
    return {
      ...swatch,
      weight: groupMeta[swatch.group]?.weight ?? 1,
      warmth: getWarmth(hsl),
      lightness: hsl.l,
      chroma: hsl.s,
      depth: 1 - hsl.l,
      luminance: relativeLuminance(rgb),
    };
  });

  const structuralSignals = getStructuralSignals(features);
  const luminances = features.map((feature) => feature.luminance);
  const metrics = {
    warmth: weightedAverage(features, 'warmth'),
    lightness: weightedAverage(features, 'lightness'),
    chroma: weightedAverage(features, 'chroma'),
    depth: weightedAverage(features, 'depth'),
    contrast: clamp(Math.max(Math.max(...luminances) - Math.min(...luminances), structuralSignals.visualContrast * 0.9), 0, 1),
    deepContrast: structuralSignals.deepContrast,
    darkDepth: structuralSignals.darkDepth,
  };
  const scores = seasonKeys
    .map((key) => ({ key, score: scoreProfile(metrics, seasonData[key].profile) }))
    .sort((a, b) => b.score - a.score);

  return {
    features,
    groups: summarizeGroups(features),
    metrics,
    scores,
    bestSeason: scores[0].key,
  };
}

function getStructuralSignals(features: Array<SeasonSwatch & { lightness: number; depth: number; weight: number }>) {
  const lightnesses = features.map((feature) => feature.lightness);
  const darkAnchors = features.filter((feature) => ['eyes', 'hair', 'brows'].includes(feature.group));
  const brightAnchors = features.filter((feature) => ['skin', 'sclera', 'lips'].includes(feature.group));
  const visualContrast = Math.max(...lightnesses) - Math.min(...lightnesses);
  const darkDepth = darkAnchors.length > 0 ? average(darkAnchors.map((feature) => feature.depth)) : weightedAverage(features, 'depth');
  const faceContrast =
    darkAnchors.length > 0 && brightAnchors.length > 0
      ? Math.max(...brightAnchors.map((feature) => feature.lightness)) - Math.min(...darkAnchors.map((feature) => feature.lightness))
      : visualContrast;
  return { visualContrast, darkDepth, deepContrast: clamp(darkDepth * 0.55 + faceContrast * 0.45, 0, 1) };
}

function summarizeGroups(features: Array<SeasonSwatch & { warmth: number; lightness: number; chroma: number }>) {
  return (Object.entries(groupMeta) as Array<[ColorGroup, (typeof groupMeta)[ColorGroup]]>)
    .map(([key, meta]) => {
      const groupFeatures = features.filter((feature) => feature.group === key);
      if (groupFeatures.length === 0) return null;
      const lightnesses = groupFeatures.map((feature) => feature.lightness);
      return {
        key,
        label: meta.label,
        count: groupFeatures.length,
        warmth: average(groupFeatures.map((feature) => feature.warmth)),
        lightness: average(lightnesses),
        chroma: average(groupFeatures.map((feature) => feature.chroma)),
        contrast: Math.max(...lightnesses) - Math.min(...lightnesses),
        colors: groupFeatures.map((feature) => feature.hex),
      };
    })
    .filter((group): group is NonNullable<typeof group> => group !== null);
}

function scoreProfile(metrics: Pick<SeasonProfile, 'warmth' | 'lightness' | 'chroma' | 'contrast' | 'depth'>, profile: SeasonProfile) {
  const distance =
    Math.abs(metrics.warmth - profile.warmth) * 0.28 +
    Math.abs(metrics.lightness - profile.lightness) * 0.2 +
    Math.abs(metrics.chroma - profile.chroma) * 0.16 +
    Math.abs(metrics.contrast - profile.contrast) * 0.2 +
    Math.abs(metrics.depth - profile.depth) * 0.16;
  return Math.round(clamp((1 - distance) * 100, 0, 100));
}

function getSubtypeResult(metrics: SeasonAnalysis['metrics'], seasonKey: SeasonKey) {
  const scores = seasonSubtypes[seasonKey]
    .map((subtype) => ({
      ...subtype,
      score: clamp(scoreProfile(metrics, subtype.profile) + getSubtypeStructureAdjustment(metrics, subtype.key), 0, 100),
    }))
    .sort((a, b) => b.score - a.score);
  return { best: scores[0], scores };
}

function getSubtypeStructureAdjustment(metrics: SeasonAnalysis['metrics'], subtypeKey: string) {
  const key = subtypeKey.toLowerCase();
  const deepSignal = metrics.deepContrast ?? 0;
  const darkDepth = metrics.darkDepth ?? metrics.depth;
  if (/deep/.test(key)) return Math.round(Math.max(0, deepSignal - 0.55) * 28 + Math.max(0, darkDepth - 0.68) * 12);
  if (/soft/.test(key) && deepSignal > 0.58) return -Math.round((deepSignal - 0.58) * 24);
  if (/light/.test(key) && darkDepth > 0.65) return -Math.round((darkDepth - 0.65) * 18);
  return 0;
}

function getBoundaryResult(analysis: SeasonAnalysis, subtypeResult: ReturnType<typeof getSubtypeResult>): BoundaryResult | null {
  const [primarySeasonScore, neighborSeasonScore] = analysis.scores;
  if (!primarySeasonScore || !neighborSeasonScore) return null;
  const gap = primarySeasonScore.score - neighborSeasonScore.score;
  const neighborSubtype = getSubtypeResult(analysis.metrics, neighborSeasonScore.key).best;
  const primarySubtype = subtypeResult.best;
  const sharedDeep = /deep/i.test(primarySubtype.key) && /deep/i.test(neighborSubtype.key) && analysis.metrics.deepContrast >= 0.64;
  if (gap > 5 || !sharedDeep) return null;

  return {
    gap,
    strength: gap <= 3 && analysis.metrics.deepContrast >= 0.72 ? 'High' : 'Medium',
    primarySeasonKey: primarySeasonScore.key,
    primarySeasonName: seasonData[primarySeasonScore.key].name,
    primarySeasonScore: primarySeasonScore.score,
    primarySubtype,
    neighborSeasonKey: neighborSeasonScore.key,
    neighborSeasonName: seasonData[neighborSeasonScore.key].name,
    neighborSeasonScore: neighborSeasonScore.score,
    neighborSubtype,
  };
}

function categorizePaletteSwatch(name: string, hex: string): PaletteCategory {
  const luminance = relativeLuminance(hexToRgb(hex));
  if (luminance < 0.08 || /deep|ink|black|midnight|navy|coffee|chocolate|burgundy|grape|berry|pine/i.test(name)) return 'deep';
  if (/white|cream|ivory|oat|gray|silver|camel|brown|taupe|caramel|tea/i.test(name)) return 'neutral';
  if (/pink|red|berry|rose|peach|coral|tomato|brick|wine|lip|cherry|magenta|plum/i.test(name)) return 'lip';
  if (/bright|electric|jewel|sunflower|lime|peacock|marigold|violet|royal|cobalt|emerald|true red/i.test(name)) return 'accent';
  return 'main';
}

function buildSeasonPalette(seasonKey: SeasonKey): PaletteSwatch[] {
  const originals = seasonData[seasonKey].palette.map(([name, hex]) => ({
    name,
    hex,
    category: categorizePaletteSwatch(name, hex),
  }));
  const variants = originals.map((swatch, index) => ({ ...createSeasonVariant(seasonKey, swatch, index), category: swatch.category }));
  return [...originals, ...variants];
}

function createSeasonVariant(seasonKey: SeasonKey, swatch: PaletteSwatch, index: number) {
  const variantMode = index % 4;
  if (seasonKey === 'spring') return { name: `${variantMode < 2 ? 'Clear' : 'Soft Glow'} ${swatch.name}`, hex: adjustHex(swatch.hex, variantMode < 2 ? 0.1 : 0.18, '#FFF6D7') };
  if (seasonKey === 'summer') return { name: `${variantMode < 2 ? 'Misty' : 'Cool Soft'} ${swatch.name}`, hex: adjustHex(swatch.hex, variantMode < 2 ? 0.16 : 0.24, '#D7DCE3') };
  if (seasonKey === 'autumn') return { name: `${variantMode < 2 ? 'Rich' : 'Warm Muted'} ${swatch.name}`, hex: adjustHex(swatch.hex, variantMode < 2 ? 0.14 : 0.2, variantMode < 2 ? '#5A3324' : '#C79A5E') };
  return { name: `${variantMode < 2 ? 'Icy' : 'Deep Cool'} ${swatch.name}`, hex: adjustHex(swatch.hex, variantMode < 2 ? 0.14 : 0.18, variantMode < 2 ? '#F7FAFF' : '#101827') };
}

function getSubtypePalette(seasonKey: SeasonKey, subtype: Subtype): PaletteSwatch[] {
  const candidates = buildSeasonPalette(seasonKey)
    .flatMap((swatch, index) => [
      swatch,
      { ...createSubtypeVariant(subtype, swatch, index), category: swatch.category },
      ...createTonalVariants(seasonKey, subtype, swatch, index),
    ]);

  return uniquePaletteSwatches(candidates)
    .map((swatch, index) => ({
      ...createSubtypeVariant(subtype, swatch, index),
      category: swatch.category,
      rank: scoreSwatchForSubtype(swatch.hex, subtype.profile, swatch.category),
    }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, 100)
    .map(({ rank, ...swatch }) => swatch);
}

function createSubtypeVariant(subtype: Subtype, swatch: PaletteSwatch, index: number) {
  const key = subtype.key.toLowerCase();
  if (/light/.test(key)) return { ...swatch, name: `Light ${swatch.name}`, hex: adjustHex(swatch.hex, 0.22, subtype.profile.warmth > 0.5 ? '#FFF2D8' : '#EEF3FA') };
  if (/soft/.test(key)) return { ...swatch, name: `Soft ${swatch.name}`, hex: adjustHex(swatch.hex, 0.2, subtype.profile.warmth > 0.5 ? '#A48D76' : '#9CA6B0') };
  if (/warm/.test(key)) return { ...swatch, name: `Warm ${swatch.name}`, hex: adjustHex(swatch.hex, 0.15, '#C6813B') };
  if (/deep/.test(key)) return { ...swatch, name: `Deep ${swatch.name}`, hex: adjustHex(swatch.hex, 0.22, subtype.profile.warmth > 0.5 ? '#2C2018' : '#111827') };
  if (/cool/.test(key)) return { ...swatch, name: `Cool ${swatch.name}`, hex: adjustHex(swatch.hex, 0.16, '#DDE7F3') };
  if (/clear/.test(key)) return { ...swatch, name: `Clear ${swatch.name}`, hex: adjustHex(swatch.hex, index % 2 === 0 ? 0.08 : 0.05, relativeLuminance(hexToRgb(swatch.hex)) > 0.45 ? '#FFFFFF' : '#111318') };
  return swatch;
}

function createTonalVariants(seasonKey: SeasonKey, subtype: Subtype, swatch: PaletteSwatch, index: number): PaletteSwatch[] {
  const warm = subtype.profile.warmth > 0.5;
  const light = subtype.profile.lightness > 0.55;
  const vivid = subtype.profile.chroma > 0.55;
  const deep = subtype.profile.depth > 0.55;
  const luminance = relativeLuminance(hexToRgb(swatch.hex));
  const seasonTargets: Record<SeasonKey, { glow: string; anchor: string; mute: string }> = {
    spring: { glow: '#FFF2C7', anchor: '#9A5D28', mute: '#C7A56F' },
    summer: { glow: '#EEF3FA', anchor: '#40516B', mute: '#9EAAB7' },
    autumn: { glow: '#F2D8A8', anchor: '#3B281E', mute: '#9B8263' },
    winter: { glow: '#F7FAFF', anchor: '#0F172A', mute: '#7C8796' },
  };
  const targets = seasonTargets[seasonKey];
  const clearTarget = luminance > 0.45 ? '#FFFFFF' : '#111318';
  const variants = [
    { label: light ? 'Airy' : 'Lifted', amount: light ? 0.18 : 0.1, target: warm ? targets.glow : '#EFF6FF' },
    { label: deep ? 'Deepened' : 'Grounded', amount: deep ? 0.2 : 0.12, target: targets.anchor },
    { label: vivid ? 'Polished' : 'Muted', amount: vivid ? 0.08 : 0.2, target: vivid ? clearTarget : targets.mute },
    { label: index % 2 === 0 ? 'Face Frame' : 'Accent', amount: vivid ? 0.12 : 0.08, target: clearTarget },
  ];

  return variants.map((variant) => ({
    name: `${variant.label} ${swatch.name}`,
    hex: adjustHex(swatch.hex, variant.amount, variant.target),
    category: swatch.category,
  }));
}

function uniquePaletteSwatches(swatches: PaletteSwatch[]) {
  const seen = new Set<string>();
  return swatches.filter((swatch) => {
    const key = `${swatch.name}-${swatch.hex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function scoreSwatchForSubtype(hex: string, profile: SeasonProfile, category: PaletteCategory) {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const lightness = hsl.l;
  const metrics = {
    warmth: getWarmth(hsl),
    lightness,
    chroma: hsl.s,
    contrast: Math.abs(lightness - 0.5) * 1.7,
    depth: 1 - lightness,
  };
  const categoryBoost = (profile.depth > 0.68 && category === 'deep') || (profile.lightness > 0.68 && category === 'neutral') || (profile.chroma > 0.72 && category === 'accent') ? 5 : 0;
  return scoreProfile(metrics, profile) + categoryBoost;
}

function adjustHex(hex: string, amount: number, targetHex: string) {
  return rgbToHex(mixRgb(hexToRgb(hex), hexToRgb(targetHex), amount));
}

function mixRgb(base: Rgb, target: Rgb, amount: number) {
  return {
    r: base.r + (target.r - base.r) * amount,
    g: base.g + (target.g - base.g) * amount,
    b: base.b + (target.b - base.b) * amount,
  };
}

function getPersonalizedAvoidPalette(seasonKey: SeasonKey, analysis: SeasonAnalysis) {
  const canUseBlack = analysis.metrics.depth >= 0.62 || analysis.metrics.contrast >= 0.52;
  const sourceOrder: Record<SeasonKey, SeasonKey[]> = {
    spring: ['autumn', 'summer', 'winter'],
    summer: ['spring', 'autumn', 'winter'],
    autumn: ['winter', 'summer', 'spring'],
    winter: ['autumn', 'spring', 'summer'],
  };
  return sourceOrder[seasonKey]
    .flatMap((sourceKey) => buildSeasonPalette(sourceKey).map((swatch) => ({ ...swatch, name: `${seasonData[sourceKey].name} ${swatch.name}` })))
    .filter((swatch) => canUseBlack || !isNearBlack(swatch.name, swatch.hex))
    .slice(0, 36);
}

function isNearBlack(name: string, hex: string) {
  return relativeLuminance(hexToRgb(hex)) < 0.04 || /pure black|ink black|charcoal|blackberry|tea black/i.test(name);
}

function getMetricRows(metrics: Pick<SeasonAnalysis['metrics'], 'warmth' | 'lightness' | 'chroma' | 'contrast' | 'depth'>) {
  return [
    { label: 'Temperature', left: 'Cool', right: 'Warm', value: metrics.warmth, detail: describeWarmth(metrics.warmth), bar: '#BF6F38' },
    { label: 'Value', left: 'Deep', right: 'Light', value: metrics.lightness, detail: describeLightness(metrics.lightness), bar: '#5D7FA6' },
    { label: 'Chroma', left: 'Soft', right: 'Vivid', value: metrics.chroma, detail: describeChroma(metrics.chroma), bar: '#2F9E7E' },
    { label: 'Contrast', left: 'Low', right: 'High', value: metrics.contrast, detail: describeContrast(metrics.contrast), bar: '#7C3AED' },
    { label: 'Depth', left: 'Light', right: 'Deep', value: metrics.depth, detail: describeDepth(metrics.depth), bar: '#2D3748' },
  ];
}

function describeWarmth(value: number) {
  if (value >= 0.62) return 'Warm';
  if (value <= 0.38) return 'Cool';
  return 'Neutral';
}

function describeLightness(value: number) {
  if (value >= 0.58) return 'Light';
  if (value <= 0.34) return 'Deep';
  return 'Medium';
}

function describeChroma(value: number) {
  if (value >= 0.58) return 'Clear';
  if (value <= 0.34) return 'Soft';
  return 'Medium chroma';
}

function describeContrast(value: number) {
  if (value >= 0.62) return 'High contrast';
  if (value <= 0.34) return 'Low contrast';
  return 'Medium-high contrast';
}

function describeDepth(value: number) {
  if (value >= 0.62) return 'High depth';
  if (value <= 0.38) return 'Low depth';
  return 'Medium depth';
}

function buildDetailedSummary(analysis: SeasonAnalysis, seasonKey: SeasonKey, boundary: BoundaryResult | null) {
  const season = seasonData[seasonKey];
  const subtype = getSubtypeResult(analysis.metrics, seasonKey).best;
  const skin = analysis.groups.find((group) => group.key === 'skin');
  const hair = analysis.groups.find((group) => group.key === 'hair');
  const eyes = analysis.groups.find((group) => group.key === 'eyes');
  const lips = analysis.groups.find((group) => group.key === 'lips');
  const cues = [describeWarmth(analysis.metrics.warmth), describeDepth(analysis.metrics.depth), describeContrast(analysis.metrics.contrast), describeChroma(analysis.metrics.chroma)];
  const categoryNotes = [];
  if (skin) categoryNotes.push(`skin reads ${describeWarmth(skin.warmth).toLowerCase()} and ${describeLightness(skin.lightness).toLowerCase()}`);
  if (hair) categoryNotes.push(`hair adds ${describeDepth(1 - hair.lightness).toLowerCase()} and lowers the overall value`);
  if (eyes) categoryNotes.push('eyes add structural contrast');
  if (lips) categoryNotes.push(`lips lean ${describeWarmth(lips.warmth).toLowerCase()} in rose or berry territory`);
  const boundaryText = boundary ? `The next closest subtype is ${boundary.neighborSubtype.name}; this is a ${boundary.strength.toLowerCase()} bridge result, so use the main season as the base and borrow nearby deep anchors. ` : '';
  return `The result leans ${season.name}, with ${subtype.name} as the closest subtype. ${boundaryText}Overall signals: ${cues.join(', ')}. ${categoryNotes.join('; ')}.`;
}

function buildGuidance(seasonKey: SeasonKey) {
  if (seasonKey === 'winter') return 'Deep hair, deep eyes, and cooler whites or lips can carry crisp contrast. Use black-white contrast, cool red, berry, jewel blue, deep grape, cool gray, and bright silver.';
  if (seasonKey === 'autumn') return 'Warm skin signals can support olive, camel, terracotta, warm brown, and bronze. If hair and eyes are deep, keep a darker structure in the outfit.';
  if (seasonKey === 'summer') return 'Cool muted colors can work well near the face and lips. If hair and eyes are deep, add gray blue or berry anchors instead of using only pale colors.';
  return 'Warm bright colors work well as energizing accents. If facial contrast is strong, choose clear Spring colors without going neon.';
}

function buildAvoidance(seasonKey: SeasonKey) {
  if (seasonKey === 'winter') return 'Avoid orange brown, yellow camel, muddy beige, dirty olive, and overly gray nude lip colors.';
  if (seasonKey === 'autumn') return 'Avoid icy white, bright silver, cool purple pink, neon peach, and strongly blue-based reds.';
  if (seasonKey === 'summer') return 'Avoid caramel brown, pumpkin orange, high-saturation yellow green, and stark black-white contrast.';
  return 'Avoid gray muddy darks, heavy burgundy, cool blue-purple, and dirty khaki.';
}

function buildHeroPattern(colors: string[]) {
  return `linear-gradient(135deg, ${colors.map((color, index) => `${color} ${index * 20}% ${(index + 1) * 20}%`).join(', ')})`;
}

function getSeasonView(analysis: SeasonAnalysis, seasonKey: SeasonKey) {
  const subtypeResult = getSubtypeResult(analysis.metrics, seasonKey);
  const boundary = seasonKey === analysis.bestSeason ? getBoundaryResult(analysis, subtypeResult) : null;
  const subtype = subtypeResult.best;
  const palette = getSubtypePalette(seasonKey, subtype);
  const avoidPalette = getPersonalizedAvoidPalette(seasonKey, analysis);
  const score = analysis.scores.find((item) => item.key === seasonKey)?.score ?? 0;
  return {
    season: seasonData[seasonKey],
    seasonName: boundary ? `${seasonData[seasonKey].name} · Bridge Type` : seasonData[seasonKey].name,
    score,
    subtype,
    subtypeScores: subtypeResult.scores,
    boundary,
    summary: buildDetailedSummary(analysis, seasonKey, boundary),
    guidance: buildGuidance(seasonKey),
    avoidance: buildAvoidance(seasonKey),
    metricRows: getMetricRows(analysis.metrics),
    palette,
    avoidPalette,
    heroPattern: buildHeroPattern(seasonData[seasonKey].hero),
  };
}

function groupPaletteByCategory(palette: PaletteSwatch[]) {
  return paletteCategories
    .map((category) => ({
      ...category,
      swatches: palette.filter((swatch) => swatch.category === category.key),
    }))
    .filter((category) => category.swatches.length > 0);
}

function extractPhotoSwatches(image: HTMLImageElement): SeasonSwatch[] {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return [];
  const maxSide = 420;
  const scale = Math.min(maxSide / image.naturalWidth, maxSide / image.naturalHeight, 1);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const { data } = context.getImageData(0, 0, width, height);
  const buckets: Record<'skin' | 'lips' | 'sclera' | 'dark' | 'fallback', Rgb[]> = { skin: [], lips: [], sclera: [], dark: [], fallback: [] };
  const step = width * height > 90000 ? 3 : 2;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      if (data[index + 3] < 220) continue;
      const rgb = { r: data[index], g: data[index + 1], b: data[index + 2] };
      const hsl = rgbToHsl(rgb);
      const group = classifyPhotoPixel(rgb, hsl, relativeLuminance(rgb));
      if (group) buckets[group].push(rgb);
      if (hsl.l > 0.08 && hsl.l < 0.92 && hsl.s < 0.72) buckets.fallback.push(rgb);
    }
  }

  const skin = buildRepresentativeColors(buckets.skin, 5, 16);
  const lips = buildRepresentativeColors(buckets.lips, 4, 20);
  const sclera = buildRepresentativeColors(buckets.sclera, 2, 10);
  const dark = buildRepresentativeColors(buckets.dark, 5, 12, 'dark');
  const fallback = buildRepresentativeColors(buckets.fallback, 8, 24);
  const swatches: SeasonSwatch[] = [
    ...skin.map((hex) => ({ hex, group: 'skin' as ColorGroup })),
    ...dark.slice(0, 3).map((hex) => ({ hex, group: 'hair' as ColorGroup })),
    ...dark.slice(0, 3).map((hex) => ({ hex, group: 'eyes' as ColorGroup })),
    ...sclera.map((hex) => ({ hex, group: 'sclera' as ColorGroup })),
    ...dark.slice(1, 3).map((hex) => ({ hex, group: 'brows' as ColorGroup })),
    ...lips.map((hex) => ({ hex, group: 'lips' as ColorGroup })),
  ];
  return swatches.length >= 6 ? swatches : fallback.map((hex) => ({ hex, group: 'unknown' }));
}

function classifyPhotoPixel(rgb: Rgb, hsl: Hsl, luminance: number): 'skin' | 'lips' | 'sclera' | 'dark' | null {
  const hue = hsl.h;
  const isWarmHue = hue <= 58 || hue >= 342;
  const isRedHue = hue <= 22 || hue >= 338;
  const redDominance = rgb.r - Math.max(rgb.g, rgb.b);
  const blueGap = rgb.r - rgb.b;
  if (hsl.l > 0.62 && hsl.l < 0.95 && hsl.s < 0.22 && luminance > 0.42) return 'sclera';
  if (isRedHue && hsl.s > 0.22 && hsl.s < 0.78 && hsl.l > 0.24 && hsl.l < 0.72 && redDominance > 8) return 'lips';
  if (isWarmHue && hsl.s > 0.12 && hsl.s < 0.68 && hsl.l > 0.28 && hsl.l < 0.86 && blueGap > 12) return 'skin';
  if (hsl.l < 0.34 && luminance < 0.14) return 'dark';
  return null;
}

function buildRepresentativeColors(samples: Rgb[], limit: number, minDistance: number, sort?: 'dark') {
  const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();
  samples.forEach((rgb) => {
    const key = [rgb.r, rgb.g, rgb.b].map((channel) => Math.round(channel / 18)).join('-');
    const bucket = buckets.get(key) ?? { count: 0, r: 0, g: 0, b: 0 };
    bucket.count += 1;
    bucket.r += rgb.r;
    bucket.g += rgb.g;
    bucket.b += rgb.b;
    buckets.set(key, bucket);
  });
  const selected: Array<{ count: number; rgb: Rgb }> = [];
  Array.from(buckets.values())
    .filter((bucket) => bucket.count >= 3)
    .map((bucket) => ({ count: bucket.count, rgb: { r: Math.round(bucket.r / bucket.count), g: Math.round(bucket.g / bucket.count), b: Math.round(bucket.b / bucket.count) } }))
    .sort((a, b) => (sort === 'dark' ? relativeLuminance(a.rgb) - relativeLuminance(b.rgb) : b.count - a.count))
    .forEach((color) => {
      if (selected.length >= limit) return;
      if (selected.every((selectedColor) => colorDistance(color.rgb, selectedColor.rgb) >= minDistance)) selected.push(color);
    });
  return selected.map((color) => rgbToHex(color.rgb));
}

function colorDistance(first: Rgb, second: Rgb) {
  return Math.sqrt((first.r - second.r) ** 2 + (first.g - second.g) ** 2 + (first.b - second.b) ** 2);
}

export {
  analyzeSwatches,
  buildHeroPattern,
  describeChroma,
  describeLightness,
  describeWarmth,
  extractPhotoSwatches,
  getSeasonView,
  groupPaletteByCategory,
  normalizeHex,
  parseBulkSwatches,
  seasonKeys,
};
