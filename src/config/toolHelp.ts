import type { ToolId } from '@/types';

type ToolHelp = {
  overview: string;
  sections: Array<{
    title: string;
    items: string[];
  }>;
};

export const toolHelp: Record<ToolId, ToolHelp> = {
  json: {
    overview: 'Work with two JSON payloads side by side: format, compare, swap, and generate merge output.',
    sections: [
      {
        title: 'Features',
        items: [
          'Format mode prettifies either the Before or After JSON and writes the formatted result back to that side.',
          'Compare mode shows changed, added, removed, and total diff counts with path-level rows for each difference.',
          'Merge can output a full merged JSON object, only changed fields, or values-only changes depending on the selected merge mode.',
          'Swap exchanges Before and After inputs, and Copy result copies the latest formatted or merged output.',
        ],
      },
      { title: 'Good for', items: ['API response review.', 'Config changes.', 'Checking payload differences before release.'] },
      { title: 'Notes', items: ['Inputs must be valid JSON.', 'Comparison is structural, not just a plain text line diff.'] },
    ],
  },
  'text-diff': {
    overview: 'Compare two text blocks line by line and produce a copyable diff summary.',
    sections: [
      {
        title: 'Features',
        items: [
          'Marks each line as added, removed, changed, or unchanged.',
          'Optional Ignore whitespace mode compares cleaner content when spacing noise is not important.',
          'Shows line-level review output in the page and exposes a Copy diff action for sharing the result.',
        ],
      },
      { title: 'Good for', items: ['Copy changes.', 'Release notes.', 'Email and i18n wording review.'] },
      { title: 'Notes', items: ['This is a text diff, not a semantic JSON parser.', 'Use JSON Lab for structural JSON differences.'] },
    ],
  },
  'markdown-table': {
    overview: 'Turn rough Markdown table text into an aligned table that is ready to paste into docs.',
    sections: [
      {
        title: 'Features',
        items: [
          'Trims every cell and normalizes row spacing.',
          'Pads rows with missing cells so columns stay aligned.',
          'Generates or repairs the Markdown separator row.',
          'Apply output sends the formatted table back to the input for another pass, and Copy formatted table copies the result.',
        ],
      },
      { title: 'Good for', items: ['README tables.', 'PR descriptions.', 'Release note checklists.'] },
      { title: 'Notes', items: ['Rows without pipe characters are ignored.', 'Escaped pipe characters inside cells are not parsed as a special case yet.'] },
    ],
  },
  'text-cleaner': {
    overview: 'Run selected cleanup rules on pasted text as a batch pipeline.',
    sections: [
      {
        title: 'Features',
        items: [
          'Normalize CRLF/LF line endings and convert full-width spaces.',
          'Trim each line, collapse repeated spaces or tabs, and remove empty lines.',
          'Add missing spaces after English commas while preserving thousands separators like 1,000.',
          'Compress text to one line, convert lines to comma-separated text, or split comma-separated text into lines.',
          'Select default cleaners, clear selected cleaners, apply output back to input, or copy the cleaned result.',
        ],
      },
      { title: 'Good for', items: ['Cleaning copied spreadsheet cells.', 'Preparing lists for docs.', 'Normalizing text from chat, email, or tickets.'] },
      { title: 'Notes', items: ['Selected rules run in the order shown.', 'Use Apply output when you want to continue cleaning the result.'] },
    ],
  },
  mask: {
    overview: 'Redact sensitive text and image regions locally before sharing logs, tickets, screenshots, or support messages.',
    sections: [
      {
        title: 'Text features',
        items: [
          'Detect emails, phone numbers, URLs, JWTs, secrets, credit cards, IPv4 addresses, UUIDs, and other common sensitive values.',
          'Choose Placeholder, Partial, or Full mask output modes.',
          'Enable a custom regex rule for one-off project-specific secrets.',
          'View per-rule match counts, apply masked output back to input, copy the masked text, or reset to the sample/default rules.',
        ],
      },
      {
        title: 'Image features',
        items: [
          'Upload one or many images and switch between them from the image list.',
          'Draw mask regions on the canvas, then move, resize, duplicate, delete, undo, or clear regions.',
          'Use pixelate, blur, or black bar styles with adjustable strength and zoom.',
          'Apply the current regions to every uploaded image, export the active masked image, or export all masked images as PNG files.',
        ],
      },
      { title: 'Notes', items: ['Rules are pattern-based and may not catch every sensitive value.', 'Text and image processing run locally in your browser.'] },
    ],
  },
  time: {
    overview: 'Parse timestamps, format dates, and batch-convert multiple time values with shared settings.',
    sections: [
      {
        title: 'Features',
        items: [
          'Accept seconds, milliseconds, microseconds, nanoseconds, or browser-parseable date strings.',
          'Use current time to fill the input instantly.',
          'Choose locale, time zone, common presets, or a custom token format.',
          'Shows detected timestamp type, ISO value, Unix seconds, Unix milliseconds, and formatted output.',
          'Batch conversion applies the same format settings to multiple timestamp lines and can copy the batch output.',
        ],
      },
      { title: 'Good for', items: ['Debugging API timestamps.', 'Checking UTC/local time conversion.', 'Preparing human-readable release or log times.'] },
      { title: 'Notes', items: ['Date string parsing follows browser Date behavior.', 'Use explicit timestamps when precision matters.'] },
    ],
  },
  workday: {
    overview: 'Calculate a deadline by adding or subtracting workdays with weekend and holiday exclusions.',
    sections: [
      {
        title: 'Features',
        items: [
          'Pick a start date, direction, and day count to calculate forward or backward deadlines.',
          'Toggle weekend exclusion for Saturday and Sunday.',
          'Add multiple custom holiday dates, remove individual holiday chips, or clear all holidays.',
          'Shows the final deadline, machine-readable date value, counted workdays, skipped weekends, and skipped holidays.',
          'Use Today, load a sample, or copy a deadline summary.',
        ],
      },
      { title: 'Good for', items: ['Planning ticket due dates.', 'Estimating response deadlines.', 'Checking delivery, review, or approval windows.'] },
      { title: 'Notes', items: ['The start date is day 0, so adding 1 day returns the next counted day.', 'Custom holidays are deduped and sorted automatically.'] },
    ],
  },
  text: {
    overview: 'Transform casing and simple line structure, then apply or copy the output.',
    sections: [
      {
        title: 'Features',
        items: [
          'Convert text to uppercase, lowercase, title case, slug/kebab-case, snake_case, camelCase, PascalCase, or CONSTANT_CASE.',
          'Trim lines, sort lines, and dedupe lines.',
          'Dedupe can ignore case and/or trim the comparison key before deciding whether a line is duplicate.',
          'Run selected transforms, apply the output back to input, or copy the result.',
        ],
      },
      { title: 'Good for', items: ['Creating variable names.', 'Normalizing copy blocks.', 'Sorting simple line lists.'] },
      { title: 'Notes', items: ['Case conversion runs before line transforms.', 'Slug and identifier modes process each line independently.'] },
    ],
  },
  image: {
    overview: 'Compress and convert a local image with preview, size metrics, and download.',
    sections: [
      {
        title: 'Features',
        items: [
          'Drag in or select an image file and preview the original.',
          'Choose Balanced, High quality, Small file, or Custom compression settings.',
          'Export as JPEG, WebP, or PNG with quality and max-width controls.',
          'Compress in the browser, compare original vs compressed file size, preview the result, and download the compressed image.',
          'Reset compression options or clear the current image.',
        ],
      },
      { title: 'Good for', items: ['Reducing image size for docs or web pages.', 'Converting image format.', 'Quick local compression before upload.'] },
      { title: 'Notes', items: ['Compression runs locally in your browser.', 'PNG quality settings may behave differently from JPEG/WebP.'] },
    ],
  },
  color: {
    overview: 'Convert colors, parse palettes, generate swatches, and check contrast.',
    sections: [
      {
        title: 'Features',
        items: [
          'Convert tab accepts HEX input or color picker selection and outputs HEX, RGB, and HSL.',
          'Palette tab parses HEX colors from spaces, commas, semicolons, pipes, or new lines, reports invalid tokens, and copies palette rows or HEX-only output.',
          'Generate tab creates opacity, alpha HEX, tint, shade, and complementary groups from one base color with a configurable swatch count.',
          'Generated and parsed swatches can be sent back into the converter by selecting a color.',
          'Contrast tab calculates WCAG contrast ratio for foreground/background colors and shows pass/fail guidance.',
        ],
      },
      { title: 'Good for', items: ['Design token checks.', 'CSS value conversion.', 'Palette cleanup.', 'Alpha and tint/shade exploration.', 'Accessibility checks before shipping UI colors.'] },
      { title: 'Notes', items: ['Generated palettes default to 10 swatches per type and cap at 24.', 'Contrast uses WCAG relative luminance and contrast ratio.'] },
    ],
  },
  'season-color': {
    overview: 'Analyze manual swatches or photo-extracted colors against four-season personal color palettes.',
    sections: [
      {
        title: 'Features',
        items: [
          'Swatches mode parses labeled HEX values for skin, eyes, sclera, hair, brows, and lips.',
          'Photo mode extracts representative colors from an uploaded image, lets you edit extracted swatch groups, and applies them to the analysis.',
          'Manual color input adds individual HEX swatches when you want to refine the current sample set.',
          'Results include Spring, Summer, Autumn, and Winter ranking, subtype, color tendency bars, suitable palette, avoid palette, and personal color group observations.',
          'Clear all samples, load sample swatches, or copy the generated style guidance summary.',
        ],
      },
      { title: 'Good for', items: ['Personal color exploration.', 'Checking wardrobe, makeup, or accessory colors.', 'Turning a color reference photo into a structured palette.'] },
      { title: 'Notes', items: ['Photo extraction is heuristic and depends on lighting quality.', 'Everything runs locally in the browser.'] },
    ],
  },
  regex: {
    overview: 'Test JavaScript regular expressions while inspecting matches, token explanations, patterns, and reference syntax.',
    sections: [
      {
        title: 'Features',
        items: [
          'Edit pattern and flags directly, then test against editable sample text.',
          'Highlights matches in context and lists match details, captures, and counts.',
          'Token analysis explains what each part of the regex is doing; selecting a token focuses its details.',
          'Pattern bank loads common presets such as email, URL, date, number, and other reusable examples.',
          'Reference panel provides searchable syntax examples for literals, classes, groups, flags, replacements, and common recipes.',
        ],
      },
      { title: 'Good for', items: ['Validating patterns before using them in code.', 'Learning what each regex token does.', 'Testing common patterns against real text.'] },
      { title: 'Notes', items: ['Behavior follows JavaScript RegExp rules.', 'Empty patterns do not show match information.'] },
    ],
  },
  jwt: {
    overview: 'Decode JWT parts into readable JSON and claim details.',
    sections: [
      {
        title: 'Features',
        items: [
          'Decode a pasted JWT into header, payload, and signature preview.',
          'Pretty-print decoded header and payload JSON.',
          'Show common claims such as issuer, subject, audience, issued-at, and expiration when present.',
          'Copy header JSON, copy payload JSON, or clear the token and decoded output.',
        ],
      },
      { title: 'Good for', items: ['Checking token claims.', 'Debugging auth payloads.', 'Inspecting expiry and issuer data.'] },
      { title: 'Notes', items: ['This tool does not verify signatures.', 'Do not paste sensitive production tokens unless you are comfortable viewing them locally.'] },
    ],
  },
  hash: {
    overview: 'Generate common SHA hashes for text using browser Web Crypto.',
    sections: [
      {
        title: 'Features',
        items: [
          'Generates SHA-1, SHA-256, SHA-384, and SHA-512 from the current input.',
          'Displays each hash as a separate copyable row.',
          'Copy all creates a multiline summary of every generated hash.',
          'Use sample text quickly fills a deterministic sample input.',
        ],
      },
      { title: 'Good for', items: ['Payload checks.', 'Debugging hash comparisons.', 'Creating deterministic text fingerprints.'] },
      { title: 'Notes', items: ['MD5 is not included because Web Crypto does not provide it.', 'Input is encoded as UTF-8 text.'] },
    ],
  },
  url: {
    overview: 'Parse URLs, edit query parameters, and rebuild the final URL.',
    sections: [
      {
        title: 'Features',
        items: [
          'Displays protocol, host, path, hash, origin, and search values from the current URL.',
          'Query builder lists each parameter row with editable key/value fields.',
          'Add parameters, remove rows, sort parameters, and remove empty query rows.',
          'Apply URL writes the rebuilt URL back into the input; Copy URL copies the rebuilt result.',
          'Relative URLs are accepted and displayed as relative while still enabling query editing.',
        ],
      },
      { title: 'Good for', items: ['Debugging tracking URLs.', 'Editing API query strings.', 'Cleaning long URLs before sharing.'] },
      { title: 'Notes', items: ['Relative URLs are parsed against an example host internally.', 'Duplicate query keys are preserved as separate rows.'] },
    ],
  },
  number: {
    overview: 'Convert integers between decimal, binary, octal, and hexadecimal representations.',
    sections: [
      {
        title: 'Features',
        items: [
          'Choose input base manually or use auto detection.',
          'Auto detection understands common prefixes like 0x, 0b, and 0o.',
          'Outputs decimal, binary, octal, and hexadecimal rows from the same integer.',
          'Uses BigInt so large integer values can still be converted.',
          'Reset sample restores the example number.',
        ],
      },
      { title: 'Good for', items: ['Debugging flags and masks.', 'Working with color or permission values.', 'Checking numeric representations.'] },
      { title: 'Notes', items: ['Only integers are supported.', 'Plain numeric input without prefix is treated as decimal.'] },
    ],
  },
  'css-unit': {
    overview: 'Convert CSS length values and create responsive clamp formulas.',
    sections: [
      {
        title: 'Features',
        items: [
          'Convert from px, rem, em, percent, vw, or vh using configurable base, parent, viewport width, and viewport height values.',
          'Output equivalent unit values in a compact copyable table.',
          'Clamp calculator generates px and rem clamp formulas from min/max size and min/max viewport inputs.',
          'Base px controls rem/em math, parent px controls percent math, and viewport dimensions control vw/vh math.',
        ],
      },
      { title: 'Good for', items: ['Checking rem sizing.', 'Converting px specs into responsive units.', 'Building fluid font-size, spacing, and component sizing values.'] },
      { title: 'Notes', items: ['em uses the base px field in this tool.', 'Percent conversion uses the parent px field.', 'Clamp rem output uses the base px field.'] },
    ],
  },
  expense: {
    overview: 'Split shared costs either equally or with detailed weighted shares.',
    sections: [
      {
        title: 'Features',
        items: [
          'Quick split divides one total equally by a people count and can copy a quick summary.',
          'Detailed split calculates subtotal, tax, tip, extra fee, grand total, and per-person amounts.',
          'Participants can have different share counts, so weighted splits like 2x or 0.5x are possible.',
          'Use detailed total can send the detailed grand total back to Quick split.',
          'Add people, reset the sample, and copy the detailed split summary.',
        ],
      },
      { title: 'Good for', items: ['Fast equal splits.', 'Group meals.', 'Shared purchases.', 'Trips or household expenses where people pay different portions.'] },
      { title: 'Notes', items: ['Quick split is a simple equal split.', 'Tax and tip are calculated from the subtotal.', 'Shares are weights, so 2 shares pays twice as much as 1 share.'] },
    ],
  },
  discount: {
    overview: 'Calculate final shopping price after sale discount, coupon, and tax.',
    sections: [
      {
        title: 'Features',
        items: [
          'Enter original price, percent discount, fixed coupon amount, tax percent, and currency label.',
          'Shows discounted subtotal, tax, final price, savings, and effective discount.',
          'Reset sample restores example promotion math.',
          'Copy summary creates a clean text version of the calculation.',
        ],
      },
      { title: 'Good for', items: ['Shopping comparisons.', 'Checking promotion math.', 'Seeing whether a coupon or sale is actually worth it.'] },
      { title: 'Notes', items: ['Coupon amount is applied after percent discount.', 'Tax is calculated from the discounted subtotal.'] },
    ],
  },
  invoice: {
    overview: 'Build a receipt-style total with discount, service charge, tax, rounding, and payment status.',
    sections: [
      {
        title: 'Features',
        items: [
          'Enter subtotal, percent discount, fixed discount, service percent, tax percent, paid amount, and currency label.',
          'Choose rounding mode: none, nearest 1/5/10, round up, or round down.',
          'Receipt output shows discount, service charge, tax, rounding adjustment, total, paid amount, change, or remaining balance.',
          'Reset sample restores example receipt values, and Copy summary creates a paste-ready summary.',
        ],
      },
      { title: 'Good for', items: ['Checking invoice math.', 'Estimating receipt totals.', 'Preparing a clean payment summary to paste into chat or notes.'] },
      { title: 'Notes', items: ['Tax is calculated after discount and service charge.', 'Rounding adjustment is shown separately so the math stays visible.'] },
    ],
  },
  subscription: {
    overview: 'Normalize subscription pricing across billing period, seats, discounts, and shared users.',
    sections: [
      {
        title: 'Features',
        items: [
          'Enter price, monthly/yearly billing, seat count, split-by count, discount percent, and currency.',
          'Calculates discounted period total, monthly equivalent, yearly equivalent, daily cost, and cost per person.',
          'Reset sample restores example values.',
          'Copy summary creates a text version for planning notes or chat.',
        ],
      },
      { title: 'Good for', items: ['Shared subscriptions.', 'SaaS tool budgeting.', 'Comparing monthly and annual plans.'] },
      { title: 'Notes', items: ['Daily cost uses a 365-day year.', 'Discount percent is applied to the entered period price.'] },
    ],
  },
  randomizer: {
    overview: 'Pick winners, shuffle items, or split a list into random groups.',
    sections: [
      {
        title: 'Features',
        items: [
          'Accept names or list items separated by lines or commas.',
          'Pick mode selects a configurable number of winners.',
          'Shuffle mode returns the full list in random order.',
          'Groups mode splits items into a configurable number of random groups.',
          'Shuffle list updates the input order directly, Reset sample restores examples, and Copy result copies the randomizer output.',
        ],
      },
      { title: 'Good for', items: ['Giveaways.', 'Team grouping.', 'Chores, turns, and simple decisions.'] },
      { title: 'Notes', items: ['Random results are generated locally in the browser.', 'Run again when you want a fresh draw.'] },
    ],
  },
  encode: {
    overview: 'Encode and decode common text formats from one shared input/output area.',
    sections: [
      {
        title: 'Features',
        items: [
          'URL encode and URL decode text.',
          'Base64 encode and Base64 decode text.',
          'HTML entity encode and decode text.',
          'Each action writes to the output area, and Copy output copies the latest transformed text.',
        ],
      },
      { title: 'Good for', items: ['Debugging URL parameters.', 'Inspecting encoded text payloads.', 'Escaping text for HTML snippets.'] },
      { title: 'Notes', items: ['Invalid encoded input may show a decoding error.', 'Base64 output is text-focused, not file-focused.'] },
    ],
  },
  csv: {
    overview: 'Parse delimited text into a table preview and JSON output.',
    sections: [
      {
        title: 'Features',
        items: [
          'Choose comma, tab, or semicolon delimiter.',
          'Uses the first row as object keys for JSON conversion.',
          'Shows parsed rows in a table preview for quick inspection.',
          'Outputs formatted JSON and provides a JSON copy action.',
        ],
      },
      { title: 'Good for', items: ['Quick CSV inspection.', 'Turning spreadsheet snippets into JSON.', 'Checking translation tables.'] },
      { title: 'Notes', items: ['This is a lightweight parser.', 'Very complex CSV quoting edge cases may need a dedicated spreadsheet tool.'] },
    ],
  },
};

export type { ToolHelp };
