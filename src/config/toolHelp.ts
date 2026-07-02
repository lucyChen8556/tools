import type { ToolId } from '../types';

type ToolHelp = {
  overview: string;
  sections: Array<{
    title: string;
    items: string[];
  }>;
};

export const toolHelp: Record<ToolId, ToolHelp> = {
  json: {
    overview: 'Format, compare, and merge JSON payloads for debugging, API review, and configuration work.',
    sections: [
      { title: 'What it does', items: ['Format either side as readable JSON.', 'Compare before and after JSON values.', 'Create merged output from detected differences.'] },
      { title: 'Good for', items: ['API response review.', 'Config changes.', 'Checking payload differences before release.'] },
      { title: 'Notes', items: ['Inputs must be valid JSON.', 'Comparison is structural, not just plain text line diff.'] },
    ],
  },
  'text-diff': {
    overview: 'Compare two blocks of text line by line and highlight what changed.',
    sections: [
      { title: 'What it does', items: ['Shows added, removed, changed, and unchanged lines.', 'Can ignore whitespace for cleaner review.', 'Copies a compact diff summary.'] },
      { title: 'Good for', items: ['Copy changes.', 'Release notes.', 'Email and i18n wording review.'] },
      { title: 'Notes', items: ['This is a text diff, not a semantic JSON parser.', 'Use JSON Lab for structural JSON differences.'] },
    ],
  },
  'markdown-table': {
    overview: 'Format messy Markdown tables into aligned, readable tables for docs and release notes.',
    sections: [
      { title: 'What it does', items: ['Trims table cells.', 'Pads missing cells.', 'Generates a separator row.', 'Aligns columns based on the widest cell.'] },
      { title: 'Good for', items: ['README tables.', 'PR descriptions.', 'Release note checklists.'] },
      { title: 'Notes', items: ['Rows without pipe characters are ignored.', 'Escaped pipe characters inside cells are not parsed as a special case yet.'] },
    ],
  },
  'text-cleaner': {
    overview: 'Apply multiple cleanup operations to messy pasted text in one run.',
    sections: [
      { title: 'What it does', items: ['Normalize line endings.', 'Trim lines, remove empty lines, and collapse extra spaces.', 'Add spaces after English commas when cleaning prose.', 'Convert lines to comma-separated text or comma-separated text to lines.'] },
      { title: 'Good for', items: ['Cleaning copied spreadsheet cells.', 'Preparing lists for docs.', 'Normalizing text from chat, email, or tickets.'] },
      { title: 'Notes', items: ['Selected rules run in the order shown.', 'Use Apply output when you want to continue cleaning the result.'] },
    ],
  },
  time: {
    overview: 'Inspect timestamps and format dates across locales, time zones, and custom patterns.',
    sections: [
      { title: 'What it does', items: ['Detects seconds, milliseconds, microseconds, nanoseconds, or date strings.', 'Formats output with locale and time zone choices.', 'Supports common preset tokens and custom date formats.', 'Converts multiple timestamps in batch using the same format settings.'] },
      { title: 'Good for', items: ['Debugging API timestamps.', 'Checking UTC/local time conversion.', 'Preparing human-readable release or log times.'] },
      { title: 'Notes', items: ['Date string parsing follows browser Date behavior.', 'Use explicit timestamps when precision matters.'] },
    ],
  },
  text: {
    overview: 'Transform text casing and line order with composable operations.',
    sections: [
      { title: 'What it does', items: ['Uppercase, lowercase, title case, slug, snake, camel, Pascal, and constant case.', 'Trim, sort, and dedupe lines.', 'Dedupe can ignore case or trim only the comparison key.', 'Copy or apply output back to input.'] },
      { title: 'Good for', items: ['Creating variable names.', 'Normalizing copy blocks.', 'Sorting simple line lists.'] },
      { title: 'Notes', items: ['Case conversion runs before line transforms.', 'Slug and identifier modes process each line independently.'] },
    ],
  },
  image: {
    overview: 'Compress images in the browser without uploading files anywhere.',
    sections: [
      { title: 'What it does', items: ['Drag or select an image.', 'Choose preset, output format, quality, and max width.', 'Preview original and compressed result before downloading.'] },
      { title: 'Good for', items: ['Reducing image size for docs or web pages.', 'Converting image format.', 'Quick local compression before upload.'] },
      { title: 'Notes', items: ['Compression runs locally in your browser.', 'PNG quality settings may behave differently from JPEG/WebP.'] },
    ],
  },
  color: {
    overview: 'Convert colors and check foreground/background contrast.',
    sections: [
      { title: 'What it does', items: ['Accepts HEX input or color picker selection.', 'Shows HEX, RGB, and HSL outputs.', 'Checks WCAG contrast ratio for foreground and background colors.'] },
      { title: 'Good for', items: ['Design token checks.', 'CSS value conversion.', 'Accessibility checks before shipping UI colors.'] },
      { title: 'Notes', items: ['Contrast uses WCAG relative luminance and contrast ratio.', 'Alpha channel conversion is not included yet.'] },
    ],
  },
  regex: {
    overview: 'Test JavaScript regular expressions, inspect matches, and read token-level explanations.',
    sections: [
      { title: 'What it does', items: ['Runs a pattern against test text.', 'Highlights matches and capture groups.', 'Explains regex tokens and provides a searchable reference.'] },
      { title: 'Good for', items: ['Validating patterns before using them in code.', 'Learning what each regex token does.', 'Testing common patterns like email, URL, dates, and numbers.'] },
      { title: 'Notes', items: ['Behavior follows JavaScript RegExp rules.', 'Empty patterns do not show match information.'] },
    ],
  },
  jwt: {
    overview: 'Decode JWT header and payload for inspection.',
    sections: [
      { title: 'What it does', items: ['Splits token parts.', 'Decodes header and payload JSON.', 'Shows common claims and signature preview.'] },
      { title: 'Good for', items: ['Checking token claims.', 'Debugging auth payloads.', 'Inspecting expiry and issuer data.'] },
      { title: 'Notes', items: ['This tool does not verify signatures.', 'Do not paste sensitive production tokens unless you are comfortable viewing them locally.'] },
    ],
  },
  hash: {
    overview: 'Generate SHA hashes for input text using browser Web Crypto.',
    sections: [
      { title: 'What it does', items: ['Generates SHA-1, SHA-256, SHA-384, and SHA-512.', 'Displays hex output.', 'Copies individual hashes or all results.'] },
      { title: 'Good for', items: ['Payload checks.', 'Debugging hash comparisons.', 'Creating deterministic text fingerprints.'] },
      { title: 'Notes', items: ['MD5 is not included because Web Crypto does not provide it.', 'Input is encoded as UTF-8 text.'] },
    ],
  },
  url: {
    overview: 'Parse URLs, edit query parameters, and rebuild the final URL.',
    sections: [
      { title: 'What it does', items: ['Extracts protocol, host, path, hash, origin, and search.', 'Lets you add, edit, sort, and remove query parameters.', 'Can remove empty query rows and apply the rebuilt URL back to input.', 'Copies the rebuilt URL.'] },
      { title: 'Good for', items: ['Debugging tracking URLs.', 'Editing API query strings.', 'Cleaning long URLs before sharing.'] },
      { title: 'Notes', items: ['Relative URLs are parsed against an example host internally.', 'Duplicate query keys are preserved as separate rows.'] },
    ],
  },
  number: {
    overview: 'Convert integer values between decimal, binary, octal, and hexadecimal.',
    sections: [
      { title: 'What it does', items: ['Auto-detects common prefixes like 0x, 0b, and 0o.', 'Outputs decimal, binary, octal, and hex values.', 'Uses BigInt for large integers.'] },
      { title: 'Good for', items: ['Debugging flags and masks.', 'Working with color or permission values.', 'Checking numeric representations.'] },
      { title: 'Notes', items: ['Only integers are supported.', 'Plain numeric input without prefix is treated as decimal.'] },
    ],
  },
  'css-unit': {
    overview: 'Convert CSS length values between px, rem, em, percent, vw, and vh.',
    sections: [
      { title: 'What it does', items: ['Normalizes a value into pixels.', 'Shows equivalent CSS units.', 'Uses configurable base size, parent width, and viewport size.'] },
      { title: 'Good for', items: ['Checking rem sizing.', 'Converting px specs into responsive units.', 'Debugging percentage and viewport-based layout values.'] },
      { title: 'Notes', items: ['em uses the base px field in this tool.', 'Percent conversion uses the parent px field.'] },
    ],
  },
  encode: {
    overview: 'Encode and decode common text formats.',
    sections: [
      { title: 'What it does', items: ['URL encode and decode.', 'Base64 encode and decode.', 'HTML entity encode and decode.'] },
      { title: 'Good for', items: ['Debugging URL parameters.', 'Inspecting encoded text payloads.', 'Escaping text for HTML snippets.'] },
      { title: 'Notes', items: ['Invalid encoded input may show a decoding error.', 'Base64 output is text-focused, not file-focused.'] },
    ],
  },
  csv: {
    overview: 'Convert CSV or spreadsheet-like text into JSON and preview rows.',
    sections: [
      { title: 'What it does', items: ['Parses comma, tab, or semicolon separated text.', 'Uses the first row as object keys.', 'Shows a table preview and JSON output.'] },
      { title: 'Good for', items: ['Quick CSV inspection.', 'Turning spreadsheet snippets into JSON.', 'Checking translation tables.'] },
      { title: 'Notes', items: ['This is a lightweight parser.', 'Very complex CSV quoting edge cases may need a dedicated spreadsheet tool.'] },
    ],
  },
};

export type { ToolHelp };
