function rgbToHsl(r: number, g: number, b: number) {
  const nr = r / 255;
  const ng = g / 255;
  const nb = b / 255;
  const max = Math.max(nr, ng, nb);
  const min = Math.min(nr, ng, nb);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case nr:
        h = (ng - nb) / d + (ng < nb ? 6 : 0);
        break;
      case ng:
        h = (nb - nr) / d + 2;
        break;
      default:
        h = (nr - ng) / d + 4;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function parseHexColor(input: string) {
  const normalized = input.trim().replace('#', '');
  const hex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => char + char)
          .join('')
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;

  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const hsl = rgbToHsl(r, g, b);
  return {
    hex: `#${hex.toUpperCase()}`,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    channels: { r, g, b },
  };
}

export function parseColorPalette(input: string) {
  const rawItems = input
    .split(/[\s,;|]+/)
    .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);

  const colors = rawItems.flatMap((item) => {
    const color = parseHexColor(item);
    return color ? [{ source: item, ...color }] : [];
  });
  const invalidItems = rawItems.filter((item) => !parseHexColor(item));

  return { colors, invalidItems, totalItems: rawItems.length };
}

export function formatPaletteOutput(colors: Array<{ hex: string; rgb: string; hsl: string }>) {
  return colors.map((color) => `${color.hex}\t${color.rgb}\t${color.hsl}`).join('\n');
}

function linearizeChannel(value: number) {
  const channel = value / 255;
  return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

export function getRelativeLuminance(color: { channels: { r: number; g: number; b: number } }) {
  const { r, g, b } = color.channels;
  return 0.2126 * linearizeChannel(r) + 0.7152 * linearizeChannel(g) + 0.0722 * linearizeChannel(b);
}

export function getContrastRatio(
  foreground: { channels: { r: number; g: number; b: number } } | null,
  background: { channels: { r: number; g: number; b: number } } | null,
) {
  if (!foreground || !background) return null;
  const foregroundLuminance = getRelativeLuminance(foreground);
  const backgroundLuminance = getRelativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

export function formatContrastRatio(ratio: number | null) {
  return ratio === null ? 'Invalid color' : `${ratio.toFixed(2)}:1`;
}

export function getContrastPassLabel(ratio: number | null, threshold: number) {
  if (ratio === null) return '-';
  return ratio >= threshold ? 'Pass' : 'Fail';
}
