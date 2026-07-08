const cssUnitOptions = [
  { label: 'px', value: 'px' },
  { label: 'rem', value: 'rem' },
  { label: 'em', value: 'em' },
  { label: '%', value: '%' },
  { label: 'vw', value: 'vw' },
  { label: 'vh', value: 'vh' },
] as const;

type CssUnit = (typeof cssUnitOptions)[number]['value'];

const cssUnitDefaults = {
  value: '24',
  unit: 'px' as CssUnit,
  basePx: '16',
  parentPx: '320',
  viewportWidth: '1440',
  viewportHeight: '900',
  clampMinSize: '16',
  clampMaxSize: '32',
  clampMinViewport: '375',
  clampMaxViewport: '1440',
};

type CssUnitContext = {
  basePx: number;
  parentPx: number;
  viewportWidth: number;
  viewportHeight: number;
};

function readCssNumber(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatCssNumber(value: number) {
  if (!Number.isFinite(value)) return '-';
  return Number.parseFloat(value.toFixed(4)).toString();
}

function formatCssValue(value: number, unit: CssUnit) {
  if (!Number.isFinite(value)) return '-';
  return `${formatCssNumber(value)}${unit}`;
}

function formatPxValue(value: number) {
  if (!Number.isFinite(value)) return '-';
  return `${formatCssNumber(value)}px`;
}

function formatRemValue(value: number, basePx: number) {
  if (!Number.isFinite(value) || !Number.isFinite(basePx) || basePx === 0) return '-';
  return `${formatCssNumber(value / basePx)}rem`;
}

function toPixels(value: number, unit: CssUnit, context: CssUnitContext) {
  if (unit === 'px') return value;
  if (unit === 'rem' || unit === 'em') return value * context.basePx;
  if (unit === '%') return (value / 100) * context.parentPx;
  if (unit === 'vw') return (value / 100) * context.viewportWidth;
  return (value / 100) * context.viewportHeight;
}

function buildCssUnitRows(value: number, unit: CssUnit, context: CssUnitContext) {
  const px = toPixels(value, unit, context);

  return {
    px,
    rows: [
      { label: 'px', value: formatCssValue(px, 'px') },
      { label: 'rem', value: formatCssValue(px / context.basePx, 'rem') },
      { label: 'em', value: formatCssValue(px / context.basePx, 'em') },
      { label: '%', value: formatCssValue((px / context.parentPx) * 100, '%') },
      { label: 'vw', value: formatCssValue((px / context.viewportWidth) * 100, 'vw') },
      { label: 'vh', value: formatCssValue((px / context.viewportHeight) * 100, 'vh') },
    ],
  };
}

function buildClamp(minSize: number, maxSize: number, minViewport: number, maxViewport: number, basePx: number) {
  const viewportRange = maxViewport - minViewport;
  if (![minSize, maxSize, minViewport, maxViewport, basePx].every(Number.isFinite) || viewportRange === 0 || basePx === 0) {
    return {
      slope: Number.NaN,
      intercept: Number.NaN,
      px: 'Invalid range',
      rem: 'Invalid range',
      preferred: 'Invalid range',
    };
  }

  const slope = ((maxSize - minSize) / viewportRange) * 100;
  const intercept = minSize - (slope * minViewport) / 100;
  const preferredPx = `${formatPxValue(intercept)} + ${formatCssNumber(slope)}vw`;
  const preferredRem = `${formatRemValue(intercept, basePx)} + ${formatCssNumber(slope)}vw`;

  return {
    slope,
    intercept,
    px: `clamp(${formatPxValue(minSize)}, calc(${preferredPx}), ${formatPxValue(maxSize)})`,
    rem: `clamp(${formatRemValue(minSize, basePx)}, calc(${preferredRem}), ${formatRemValue(maxSize, basePx)})`,
    preferred: `calc(${preferredPx})`,
  };
}

export { buildClamp, buildCssUnitRows, cssUnitDefaults, cssUnitOptions, formatCssNumber, formatPxValue, readCssNumber };
export type { CssUnit };
