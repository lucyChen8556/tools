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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toHexByte(value: number) {
  return Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0').toUpperCase();
}

function channelsToHex(channels: { r: number; g: number; b: number }) {
  return `#${toHexByte(channels.r)}${toHexByte(channels.g)}${toHexByte(channels.b)}`;
}

function channelsToRgb(channels: { r: number; g: number; b: number }) {
  return `rgb(${Math.round(channels.r)}, ${Math.round(channels.g)}, ${Math.round(channels.b)})`;
}

function channelsToHsl(channels: { r: number; g: number; b: number }) {
  const hsl = rgbToHsl(channels.r, channels.g, channels.b);
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

function mixChannels(
  color: { r: number; g: number; b: number },
  target: { r: number; g: number; b: number },
  amount: number,
) {
  return {
    r: color.r + (target.r - color.r) * amount,
    g: color.g + (target.g - color.g) * amount,
    b: color.b + (target.b - color.b) * amount,
  };
}

function hslToRgb(h: number, s: number, l: number) {
  const normalizedS = s / 100;
  const normalizedL = l / 100;
  const c = (1 - Math.abs(2 * normalizedL - 1)) * normalizedS;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = normalizedL - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
  };
}

function buildGeneratedSwatch(label: string, channels: { r: number; g: number; b: number }, cssValue?: string) {
  const roundedChannels = {
    r: Math.round(channels.r),
    g: Math.round(channels.g),
    b: Math.round(channels.b),
  };
  const hex = channelsToHex(roundedChannels);

  return {
    label,
    hex,
    rgb: channelsToRgb(roundedChannels),
    hsl: channelsToHsl(roundedChannels),
    css: cssValue ?? hex,
    preview: cssValue ?? hex,
    baseHex: hex,
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

export function normalizeGeneratedCount(value: string | number, max = 24) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 10;
  return Math.round(clamp(parsed, 1, max));
}

export function generateColorPalettes(baseInput: string, countInput: string | number) {
  const baseColor = parseHexColor(baseInput);
  const count = normalizeGeneratedCount(countInput);
  if (!baseColor) return { baseColor: null, count, groups: [] };

  const { r, g, b } = baseColor.channels;
  const hsl = rgbToHsl(r, g, b);
  const complementaryHue = (hsl.h + 180) % 360;
  const steps = Array.from({ length: count }, (_, index) => (index + 1) / count);

  const groups = [
    {
      id: 'opacity',
      label: 'Opacity',
      colors: steps.map((step, index) => {
        const alpha = Number(step.toFixed(2));
        return buildGeneratedSwatch(
          `${Math.round(alpha * 100)}%`,
          baseColor.channels,
          `rgba(${r}, ${g}, ${b}, ${alpha})`,
        );
      }),
    },
    {
      id: 'alpha-hex',
      label: 'Alpha HEX',
      colors: steps.map((step) => {
        const alphaHex = toHexByte(step * 255);
        const label = `${Math.round(step * 100)}%`;
        return {
          ...buildGeneratedSwatch(label, baseColor.channels, `${baseColor.hex}${alphaHex}`),
          hex: `${baseColor.hex}${alphaHex}`,
        };
      }),
    },
    {
      id: 'tints',
      label: 'Tints',
      colors: steps.map((step, index) => buildGeneratedSwatch(`Tint ${index + 1}`, mixChannels(baseColor.channels, { r: 255, g: 255, b: 255 }, step))),
    },
    {
      id: 'shades',
      label: 'Shades',
      colors: steps.map((step, index) => buildGeneratedSwatch(`Shade ${index + 1}`, mixChannels(baseColor.channels, { r: 0, g: 0, b: 0 }, step))),
    },
    {
      id: 'complementary',
      label: 'Complementary',
      colors: steps.map((step, index) => {
        const lightness = count === 1 ? hsl.l : 18 + step * 64;
        return buildGeneratedSwatch(
          `Contrast ${index + 1}`,
          hslToRgb(complementaryHue, clamp(hsl.s, 20, 92), clamp(lightness, 8, 92)),
        );
      }),
    },
  ];

  return { baseColor, count, groups };
}

export function formatGeneratedPaletteOutput(groups: Array<{ label: string; colors: Array<{ css: string; rgb: string; hsl: string }> }>) {
  return groups
    .map((group) => [group.label, ...group.colors.map((color) => `${color.css}\t${color.rgb}\t${color.hsl}`)].join('\n'))
    .join('\n\n');
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
