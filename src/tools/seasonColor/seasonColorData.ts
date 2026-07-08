import type { ColorGroup, PaletteCategory, SeasonKey, SeasonProfile, Subtype } from './seasonColorTypes';

type BaseSeason = {
  name: string;
  label: string;
  description: string;
  guidance: string;
  avoid: string;
  profile: SeasonProfile;
  hero: string[];
  palette: Array<[string, string]>;
};

const seasonData: Record<SeasonKey, BaseSeason> = {
  spring: {
    name: 'Bright Spring',
    label: 'Spring palette',
    description: 'Warm, bright, and clear colors with a sunny feeling and lively saturation.',
    guidance: 'Use cream, apricot, fresh grass green, and coral near the face. Keep makeup clean, transparent, and luminous.',
    avoid: 'Muddy khaki, heavy burgundy, matte dark brown, and gray-blue purple.',
    profile: { warmth: 0.72, lightness: 0.72, chroma: 0.76, contrast: 0.42, depth: 0.28 },
    hero: ['#F7C65D', '#FF8F70', '#7AC47F', '#F6E7C8', '#5DB8C6'],
    palette: [
      ['Cream', '#F7EBCB'],
      ['Apricot Pink', '#F7A884'],
      ['Coral Orange', '#F36F5F'],
      ['Sunflower Yellow', '#F2C84B'],
      ['Fresh Grass', '#8BCB74'],
      ['Mint Blue', '#74C7BE'],
      ['Warm Navy', '#2D5872'],
      ['Bright Peach Violet', '#D36EA3'],
      ['Green Apple', '#9AD66F'],
      ['Marigold', '#ECA23A'],
      ['Warm Camel', '#C89B61'],
      ['Clear Berry Red', '#D94F70'],
    ],
  },
  summer: {
    name: 'Soft Summer',
    label: 'Summer palette',
    description: 'Cool, softly bright, and muted colors with a low-contrast morning haze quality.',
    guidance: 'Use dusty rose, gray blue, sage, and pearl white near the face. Soft-focus makeup and silver metals work well.',
    avoid: 'Neon orange, mustard yellow, caramel brown, stark black-white contrast, and very warm gold.',
    profile: { warmth: 0.24, lightness: 0.68, chroma: 0.36, contrast: 0.32, depth: 0.32 },
    hero: ['#B9C7D9', '#D9A9B8', '#8FAE9F', '#ECE7E3', '#8D8AAB'],
    palette: [
      ['Pearl White', '#ECE7E3'],
      ['Dusty Rose', '#D7A6B4'],
      ['Lavender', '#B8A8CF'],
      ['Gray Blue', '#8BA7C2'],
      ['Sage', '#93AA99'],
      ['Berry Rose', '#B95F78'],
      ['Soft Navy', '#4B5F7A'],
      ['Cool Taupe', '#8A7E79'],
      ['Moon Gray', '#C6C8CA'],
      ['Cool Mint', '#A7C9BE'],
      ['Soft Burgundy', '#713A4A'],
      ['Misty Blueberry', '#59677F'],
    ],
  },
  autumn: {
    name: 'Warm Autumn',
    label: 'Autumn palette',
    description: 'Warm, deeper, and softened colors with grounded earthiness and mature depth.',
    guidance: 'Use olive, camel, terracotta, cinnamon, and warm ink blue as core colors. Bronze, brick, and brown-rose makeup work well.',
    avoid: 'Icy white, bright silver, cool pink, neon colors, and blue-based magenta.',
    profile: { warmth: 0.78, lightness: 0.38, chroma: 0.44, contrast: 0.52, depth: 0.68 },
    hero: ['#A85D36', '#C89A55', '#6E7C45', '#4C332A', '#D6C09A'],
    palette: [
      ['Oat White', '#E5D6B8'],
      ['Camel', '#B9854D'],
      ['Terracotta', '#B75B36'],
      ['Cinnamon Brown', '#8B4F32'],
      ['Olive Green', '#6F7C45'],
      ['Forest Pine', '#3F5C4A'],
      ['Mustard', '#C49B32'],
      ['Warm Ink Blue', '#314D56'],
      ['Caramel', '#B66E2E'],
      ['Desert Rose', '#B87868'],
      ['Peacock Green', '#2F6D66'],
      ['Tea Black', '#2C2520'],
    ],
  },
  winter: {
    name: 'Cool Winter',
    label: 'Winter palette',
    description: 'Cool, high-contrast, and sharply defined colors with a crisp visual presence.',
    guidance: 'Use pure white, black, jewel blue, cool red, berry purple, and emerald for clear contrast.',
    avoid: 'Muted beige, muddy olive, caramel brown, orange-brown lip colors, and low-contrast nude tones.',
    profile: { warmth: 0.18, lightness: 0.36, chroma: 0.62, contrast: 0.78, depth: 0.72 },
    hero: ['#101820', '#F7F8FA', '#A0143E', '#184D8B', '#00856F'],
    palette: [
      ['Icy White', '#F7F8FA'],
      ['Pure Black', '#111318'],
      ['Jewel Blue', '#1458A8'],
      ['Cool Red', '#B4123D'],
      ['Berry Purple', '#6F2C7E'],
      ['Emerald', '#00856F'],
      ['Bright Silver', '#C8CDD3'],
      ['Deep Grape', '#332249'],
      ['Royal Blue', '#203A8F'],
      ['Magenta', '#C0007A'],
      ['Icy Pink', '#F4C9D8'],
      ['Ink Black', '#050608'],
    ],
  },
};

const paletteCategories: Array<{ key: PaletteCategory; label: string; note: string }> = [
  { key: 'neutral', label: 'Neutrals', note: 'Outerwear, shirts, bottoms, and larger base colors' },
  { key: 'main', label: 'Main colors', note: 'Tops, dresses, knitwear, and colors close to the face' },
  { key: 'accent', label: 'Accent colors', note: 'Bags, shoes, scarves, nails, and small bright details' },
  { key: 'lip', label: 'Lip and cheek colors', note: 'Lipstick, blush, jewelry, and makeup focus colors' },
  { key: 'deep', label: 'Deep anchors', note: 'Eyeliner, coats, leather goods, and colors that add structure' },
];

const seasonSubtypes: Record<SeasonKey, Subtype[]> = {
  spring: [
    { key: 'lightSpring', name: 'Light Spring', summary: 'The lightest Spring subtype, best with cream, peach, clear pale green, and water blue.', profile: { warmth: 0.62, lightness: 0.78, chroma: 0.58, contrast: 0.3, depth: 0.22 }, traits: ['High lightness', 'Lower contrast', 'Gentle warmth'] },
    { key: 'warmSpring', name: 'Warm Spring', summary: 'The warmest Spring subtype, best with sunny yellow, apricot, coral, and warm greens.', profile: { warmth: 0.82, lightness: 0.62, chroma: 0.62, contrast: 0.4, depth: 0.36 }, traits: ['Warmth-led', 'Medium lightness', 'Clear not muddy'] },
    { key: 'clearSpring', name: 'Clear Spring', summary: 'The clearest Spring subtype, best with vivid, clean, energetic color.', profile: { warmth: 0.58, lightness: 0.58, chroma: 0.82, contrast: 0.58, depth: 0.42 }, traits: ['High chroma', 'Medium-high contrast', 'Clear color edge'] },
  ],
  summer: [
    { key: 'lightSummer', name: 'Light Summer', summary: 'The lightest Summer subtype, best with misty pink, powder blue, pearl white, and pale lavender.', profile: { warmth: 0.28, lightness: 0.78, chroma: 0.34, contrast: 0.26, depth: 0.22 }, traits: ['High lightness', 'Low contrast', 'Cool and delicate'] },
    { key: 'coolSummer', name: 'Cool Summer', summary: 'The coolest Summer subtype, best with gray blue, rose pink, lavender, and cool gray.', profile: { warmth: 0.16, lightness: 0.58, chroma: 0.38, contrast: 0.34, depth: 0.42 }, traits: ['Coolness-led', 'Medium lightness', 'Soft haze'] },
    { key: 'softSummer', name: 'Soft Summer', summary: 'The most muted Summer subtype, best with gray rose, sage, misty blue, and low-chroma berry.', profile: { warmth: 0.34, lightness: 0.5, chroma: 0.24, contrast: 0.28, depth: 0.5 }, traits: ['Low chroma', 'Low contrast', 'Muted gray cast'] },
  ],
  autumn: [
    { key: 'softAutumn', name: 'Soft Autumn', summary: 'The softest Autumn subtype, best with warm taupe, soft olive, desert rose, and muted earth tones.', profile: { warmth: 0.62, lightness: 0.5, chroma: 0.28, contrast: 0.34, depth: 0.5 }, traits: ['Soft low chroma', 'Warm with gray', 'Gentle contrast'] },
    { key: 'warmAutumn', name: 'Warm Autumn', summary: 'The warmest Autumn subtype, best with camel, mustard, terracotta, pumpkin, and bronze.', profile: { warmth: 0.84, lightness: 0.4, chroma: 0.44, contrast: 0.48, depth: 0.64 }, traits: ['Warmth-led', 'Medium-deep value', 'Earthy quality'] },
    { key: 'deepAutumn', name: 'Deep Autumn', summary: 'The deepest Autumn subtype, best with deep olive, warm burgundy, tea black, coffee, and petrol blue.', profile: { warmth: 0.68, lightness: 0.26, chroma: 0.42, contrast: 0.64, depth: 0.76 }, traits: ['High depth', 'Medium-high contrast', 'Warm deep anchors'] },
  ],
  winter: [
    { key: 'deepWinter', name: 'Deep Winter', summary: 'The deepest Winter subtype, best with black, deep wine, ink blue, deep grape, and high contrast.', profile: { warmth: 0.28, lightness: 0.22, chroma: 0.54, contrast: 0.76, depth: 0.82 }, traits: ['Highest depth', 'High contrast', 'Cool deep structure'] },
    { key: 'coolWinter', name: 'Cool Winter', summary: 'The coolest Winter subtype, best with icy white, cool red, jewel blue, bright silver, and pure cool colors.', profile: { warmth: 0.1, lightness: 0.36, chroma: 0.58, contrast: 0.72, depth: 0.66 }, traits: ['Coolness-led', 'Clear contrast', 'Icy clean edge'] },
    { key: 'clearWinter', name: 'Clear Winter', summary: 'The clearest Winter subtype, best with true red, cobalt, emerald, magenta, and black-white contrast.', profile: { warmth: 0.22, lightness: 0.42, chroma: 0.86, contrast: 0.86, depth: 0.62 }, traits: ['Highest chroma', 'High contrast', 'Sharp color boundary'] },
  ],
};

const groupMeta: Record<ColorGroup, { label: string; weight: number }> = {
  skin: { label: 'Skin', weight: 1.25 },
  eyes: { label: 'Eyes', weight: 1.18 },
  sclera: { label: 'Sclera', weight: 0.82 },
  hair: { label: 'Hair', weight: 1.15 },
  brows: { label: 'Brows', weight: 0.95 },
  lips: { label: 'Lips', weight: 1.1 },
  manual: { label: 'Manual', weight: 1 },
  reference: { label: 'Reference', weight: 1 },
  unknown: { label: 'Uncategorized', weight: 1 },
};

const photoEditableGroups: ColorGroup[] = ['skin', 'eyes', 'sclera', 'hair', 'brows', 'lips', 'unknown'];

const quickPalettes: Record<SeasonKey, string[]> = {
  spring: ['#F7C65D', '#FF8F70', '#8BCB74', '#F7EBCB'],
  summer: ['#D7A6B4', '#8BA7C2', '#93AA99', '#ECE7E3'],
  autumn: ['#B75B36', '#6F7C45', '#B9854D', '#314D56'],
  winter: ['#111318', '#F7F8FA', '#B4123D', '#1458A8'],
};

const seasonColorDefaults = {
  bulkInput: 'skin #D8B2A6 #C99B8F eyes #4B3A35 #332725 sclera #D5D8D8 hair #2E2724 brows #4A3C38 lips #A8666B #8A4A4F',
  color: '#D88C5A',
  status: 'Labels such as skin, eyes, sclera, hair, brows, and lips are detected automatically with HEX colors.',
  photoStatus: 'The photo extractor estimates skin, eyes, sclera, hair, brows, and lips. Natural light works best.',
};

export { groupMeta, paletteCategories, photoEditableGroups, quickPalettes, seasonColorDefaults, seasonData, seasonSubtypes };
