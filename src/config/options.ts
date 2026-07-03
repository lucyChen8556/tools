import type { JsonMergeMode } from '../types';

type SelectOption<T extends string = string> = {
  label: string;
  value: T;
};

export const textCaseOptions = [
  { label: 'No change', value: 'none' },
  { label: 'Uppercase', value: 'upper' },
  { label: 'Lowercase', value: 'lower' },
  { label: 'Title Case', value: 'title' },
  { label: 'Slug / kebab-case', value: 'slug' },
  { label: 'snake_case', value: 'snake' },
  { label: 'camelCase', value: 'camel' },
  { label: 'PascalCase', value: 'pascal' },
  { label: 'CONSTANT_CASE', value: 'constant' },
] as const;

export type TextCaseMode = (typeof textCaseOptions)[number]['value'];

export const csvDelimiterOptions = [
  { label: 'Comma', value: 'comma', delimiter: ',' },
  { label: 'Tab', value: 'tab', delimiter: '\t' },
  { label: 'Semicolon', value: 'semicolon', delimiter: ';' },
] as const;

export type CsvDelimiterId = (typeof csvDelimiterOptions)[number]['value'];

export const jsonMergeModeOptions = [
  { label: 'Full', value: 'full' },
  { label: 'Differences', value: 'diff' },
  { label: 'Values only', value: 'value' },
] as const satisfies ReadonlyArray<SelectOption<JsonMergeMode>>;

export const invoiceRoundingOptions = [
  { label: 'No rounding', value: 'none' },
  { label: 'Nearest 1', value: 'nearest-1' },
  { label: 'Nearest 5', value: 'nearest-5' },
  { label: 'Nearest 10', value: 'nearest-10' },
  { label: 'Round up', value: 'up-1' },
  { label: 'Round down', value: 'down-1' },
] as const;

export type InvoiceRoundingMode = (typeof invoiceRoundingOptions)[number]['value'];

export const compressionPresetOptions = [
  { label: 'Balanced', value: 'balanced', quality: 0.8, maxWidth: 1600 },
  { label: 'High quality', value: 'quality', quality: 0.9, maxWidth: 2400 },
  { label: 'Small file', value: 'small', quality: 0.55, maxWidth: 1200 },
  { label: 'Custom', value: 'custom' },
] as const;

export type CompressionPreset = (typeof compressionPresetOptions)[number]['value'];
export type CompressionPresetWithSettings = Exclude<CompressionPreset, 'custom'>;

export const outputFormatOptions = [
  { label: 'JPEG', value: 'image/jpeg', extension: 'jpg' },
  { label: 'WebP', value: 'image/webp', extension: 'webp' },
  { label: 'PNG', value: 'image/png', extension: 'png' },
] as const;

export type OutputFormat = (typeof outputFormatOptions)[number]['value'];

export const localeOptions = [
  { label: 'Browser default', value: 'default' },
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
  { label: 'Traditional Chinese', value: 'zh-TW' },
  { label: 'Simplified Chinese', value: 'zh-CN' },
  { label: 'Japanese', value: 'ja-JP' },
  { label: 'Korean', value: 'ko-KR' },
  { label: 'German', value: 'de-DE' },
  { label: 'French', value: 'fr-FR' },
] as const;

export const timeZoneOptions = [
  { label: 'Browser default', value: 'default' },
  { label: 'Taipei', value: 'Asia/Taipei' },
  { label: 'UTC', value: 'UTC' },
  { label: 'New York', value: 'America/New_York' },
  { label: 'Los Angeles', value: 'America/Los_Angeles' },
  { label: 'London', value: 'Europe/London' },
  { label: 'Berlin', value: 'Europe/Berlin' },
  { label: 'Tokyo', value: 'Asia/Tokyo' },
  { label: 'Seoul', value: 'Asia/Seoul' },
  { label: 'Singapore', value: 'Asia/Singapore' },
] as const;

export const timeFormatPresetOptions = [
  'YYYY-MM-DD HH:mm:ss',
  'YYYY/MM/DD HH:mm',
  'MMM D, YYYY h:mm A',
  'dddd, MMMM D, YYYY HH:mm',
  'L',
  'LL',
  'LLL',
  'LLLL',
  'l',
  'll',
  'lll',
  'llll',
] as const;
