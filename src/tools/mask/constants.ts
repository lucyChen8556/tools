type MaskToolTab = 'text' | 'image';

type TextMaskRuleId = 'email' | 'jwt' | 'secret' | 'credit-card' | 'phone' | 'url' | 'ipv4' | 'tw-id' | 'uuid';

type TextMaskRule = {
  id: TextMaskRuleId;
  label: string;
  pattern: RegExp;
  placeholder: string;
  maskPartial?: (value: string) => string;
};

type TextMaskStats = Record<TextMaskRuleId, number>;

type ImageMaskMode = 'pixelate' | 'blur' | 'bar';
type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

type ImageMask = {
  x: number;
  y: number;
  w: number;
  h: number;
  mode: ImageMaskMode;
  strength: number;
};

type MaskImage = {
  id: string;
  name: string;
  url: string;
  img: HTMLImageElement;
  width: number;
  height: number;
  masks: ImageMask[];
};

type Point = {
  x: number;
  y: number;
};

type DrawingState = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

type InteractionState = {
  type: 'move' | 'resize';
  handle: ResizeHandle | null;
  maskIndex: number;
  startPoint: Point;
  originalMask: ImageMask;
};

const maskToolTabs = [
  { label: 'Text', value: 'text' },
  { label: 'Image', value: 'image' },
] as const;

const textMaskRules: TextMaskRule[] = [
  {
    id: 'email',
    label: 'Email addresses',
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    placeholder: '[EMAIL]',
    maskPartial: (value) => {
      const [name = '', domain = ''] = value.split('@');
      return `${name.slice(0, 1)}${'*'.repeat(Math.max(3, name.length - 1))}@${domain}`;
    },
  },
  {
    id: 'jwt',
    label: 'JWT tokens',
    pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
    placeholder: '[JWT]',
    maskPartial: (value) => `${value.slice(0, 12)}...${value.slice(-8)}`,
  },
  {
    id: 'secret',
    label: 'Secrets and API keys',
    pattern: /\b(api[_-]?key|token|secret|password|authorization)\s*[:=]\s*(?:Bearer\s+)?["']?([A-Za-z0-9._\-+/=]{8,})["']?/gi,
    placeholder: '[SECRET]',
    maskPartial: (value) => value.replace(/([:=]\s*(?:Bearer\s+)?["']?)([A-Za-z0-9._\-+/=]{4})[A-Za-z0-9._\-+/=]+/i, '$1$2...'),
  },
  {
    id: 'credit-card',
    label: 'Credit cards',
    pattern: /\b(?:\d[ -]*?){13,19}\b/g,
    placeholder: '[CARD]',
    maskPartial: (value) => {
      const digits = value.replace(/\D/g, '');
      return `**** **** **** ${digits.slice(-4)}`;
    },
  },
  {
    id: 'phone',
    label: 'Phone numbers',
    pattern: /(?<![\dA-Za-z])(?:\+?\d[\d\s().-]{7,}\d)(?![\dA-Za-z])/g,
    placeholder: '[PHONE]',
    maskPartial: (value) => `${value.slice(0, 3)}${'*'.repeat(Math.max(4, value.length - 6))}${value.slice(-3)}`,
  },
  {
    id: 'url',
    label: 'URLs',
    pattern: /\bhttps?:\/\/[^\s<>"')]+/gi,
    placeholder: '[URL]',
    maskPartial: (value) => {
      try {
        const url = new URL(value);
        return `${url.origin}/...`;
      } catch {
        return '[URL]';
      }
    },
  },
  {
    id: 'ipv4',
    label: 'IPv4 addresses',
    pattern: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
    placeholder: '[IP]',
    maskPartial: (value) => value.replace(/\.\d+$/, '.***'),
  },
  {
    id: 'tw-id',
    label: 'Taiwan IDs',
    pattern: /\b[A-Z][12]\d{8}\b/g,
    placeholder: '[ID]',
    maskPartial: (value) => `${value.slice(0, 2)}*****${value.slice(-2)}`,
  },
  {
    id: 'uuid',
    label: 'UUIDs',
    pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
    placeholder: '[UUID]',
    maskPartial: (value) => `${value.slice(0, 8)}-...-${value.slice(-12)}`,
  },
];

const defaultTextMaskRuleIds: TextMaskRuleId[] = ['email', 'jwt', 'secret', 'credit-card', 'phone', 'url', 'ipv4'];

const textMaskSample = `Customer: Amy Chen
Email: amy.chen@example.com
Phone: +886 912-345-678
URL: https://example.com/orders?id=1001&token=debug
API key: sk_live_1234567890abcdef
Authorization: Bearer abcdefghijklmnopqrstuvwxyz
JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTYifQ.signature123
Card: 4111 1111 1111 1111
IP: 192.168.10.24
Taiwan ID: A123456789
Request ID: 123e4567-e89b-12d3-a456-426614174000`;

const textMaskCustomRuleDefaults = {
  pattern: 'order_[A-Z0-9]+',
  flags: 'gi',
  label: 'CUSTOM',
};

const textMaskDefaultMode = 'placeholder';

const imageMaskModeOptions = [
  { label: 'Pixelate', value: 'pixelate' },
  { label: 'Blur', value: 'blur' },
  { label: 'Black bar', value: 'bar' },
] as const;

const imageMaskDefaultMode = 'pixelate';

const imageMaskStrengthConfig = {
  min: 4,
  max: 32,
  defaultValue: 14,
};

const imageMaskZoomConfig = {
  min: 1,
  max: 4,
  step: 0.25,
  defaultValue: 1,
};

const imageMaskCanvasFitConfig = {
  padding: 32,
  minSize: 240,
};

const imageMaskInteractionConfig = {
  duplicateOffset: 0.025,
  minSize: 0.006,
  handleSize: 12,
  exportBatchDelayMs: 180,
  objectUrlRevokeDelayMs: 1000,
};

const imageMaskCopy = {
  upload: 'Drop images here or click to upload',
  noImages: 'No images uploaded',
  noRegions: 'No regions yet',
  emptyTitle: 'Upload an image, then drag to mask sensitive areas.',
  emptyDescription: 'Draw multiple regions, move or resize selected masks, then export as PNG.',
};

export {
  defaultTextMaskRuleIds,
  imageMaskCanvasFitConfig,
  imageMaskCopy,
  imageMaskDefaultMode,
  imageMaskInteractionConfig,
  imageMaskModeOptions,
  imageMaskStrengthConfig,
  imageMaskZoomConfig,
  maskToolTabs,
  textMaskCustomRuleDefaults,
  textMaskDefaultMode,
  textMaskRules,
  textMaskSample,
};
export type {
  DrawingState,
  ImageMask,
  ImageMaskMode,
  InteractionState,
  MaskImage,
  MaskToolTab,
  Point,
  ResizeHandle,
  TextMaskRule,
  TextMaskRuleId,
  TextMaskStats,
};
