type RegexReferenceItem = {
  syntax: string;
  description: string;
  example: string;
};

export type RegexReferenceGroup = {
  id: string;
  title: string;
  items: RegexReferenceItem[];
};

export const regexReferenceGroups: RegexReferenceGroup[] = [
  {
    id: 'literals',
    title: 'Literals and Escaping',
    items: [
      { syntax: 'abc', description: 'Match these characters literally.', example: 'hello' },
      { syntax: '\\.', description: 'Match a literal dot.', example: 'example\\.com' },
      { syntax: '\\*', description: 'Match a literal asterisk.', example: '2\\*3' },
      { syntax: '\\+', description: 'Match a literal plus sign.', example: 'C\\+\\+' },
      { syntax: '\\?', description: 'Match a literal question mark.', example: 'ready\\?' },
      { syntax: '\\|', description: 'Match a literal pipe.', example: 'A\\|B' },
      { syntax: '\\\\', description: 'Match a literal backslash.', example: 'C:\\\\Users' },
      { syntax: '\\/', description: 'Escape a slash inside a regex literal.', example: '\\/api\\/v1' },
      { syntax: '\\0', description: 'Null character.', example: '\\0' },
      { syntax: '\\cX', description: 'Control character.', example: '\\cM' },
      { syntax: '\\xHH', description: 'Character by two-digit hex code.', example: '\\xA9' },
      { syntax: '\\uHHHH', description: 'Character by four-digit unicode code unit.', example: '\\u00A9' },
      { syntax: '\\u{H...}', description: 'Character by unicode code point. Requires u or v flag.', example: '\\u{1F600}' },
    ],
  },
  {
    id: 'character-shortcuts',
    title: 'Character Shortcuts',
    items: [
      { syntax: '.', description: 'Any character except a line break. With s flag, includes line breaks.', example: 'a.c' },
      { syntax: '\\d', description: 'ASCII digit character.', example: '\\d{4}' },
      { syntax: '\\D', description: 'Non-digit character.', example: '\\D+' },
      { syntax: '\\w', description: 'Word character: letter, digit, or underscore.', example: '\\w+' },
      { syntax: '\\W', description: 'Non-word character.', example: '\\W+' },
      { syntax: '\\s', description: 'Whitespace character.', example: '\\s+' },
      { syntax: '\\S', description: 'Non-whitespace character.', example: '\\S+' },
      { syntax: '\\f', description: 'Form feed character.', example: '\\f' },
      { syntax: '\\n', description: 'Line feed.', example: 'line\\nnext' },
      { syntax: '\\r', description: 'Carriage return.', example: '\\r\\n' },
      { syntax: '\\t', description: 'Tab character.', example: 'foo\\tbar' },
      { syntax: '\\v', description: 'Vertical tab character.', example: '\\v' },
    ],
  },
  {
    id: 'classes',
    title: 'Character Classes',
    items: [
      { syntax: '[abc]', description: 'One character from the set.', example: '[aeiou]' },
      { syntax: '[^abc]', description: 'One character not in the set.', example: '[^0-9]' },
      { syntax: '[a-z]', description: 'One character in a range.', example: '[A-Z]' },
      { syntax: '[a-zA-Z0-9_]', description: 'Combine ranges and literals.', example: '[A-Za-z0-9_]' },
      { syntax: '[\\w.-]', description: 'Use escaped classes and literals inside a class.', example: '[\\w.-]+' },
      { syntax: '[-abc]', description: 'Put hyphen first or last to match it literally.', example: '[-\\w]+' },
      { syntax: '[]]', description: 'Put closing bracket first to match it literally.', example: '[])]' },
      { syntax: '[\\\\]', description: 'Match a literal backslash inside a class.', example: '[\\\\/]' },
      { syntax: '[\\s\\S]', description: 'Common any-character pattern, including line breaks.', example: '[\\s\\S]*' },
      { syntax: '[^]', description: 'Any character, including line breaks.', example: '[^]*' },
    ],
  },
  {
    id: 'unicode',
    title: 'Unicode Classes',
    items: [
      { syntax: '\\p{Letter}', description: 'Unicode letters. Requires u or v flag.', example: '\\p{Letter}+' },
      { syntax: '\\P{Letter}', description: 'Not unicode letters. Requires u or v flag.', example: '\\P{Letter}+' },
      { syntax: '\\p{Number}', description: 'Unicode numbers. Requires u or v flag.', example: '\\p{Number}+' },
      { syntax: '\\p{Script=Han}', description: 'Characters in a unicode script. Requires u or v flag.', example: '\\p{Script=Han}+' },
      { syntax: '\\p{Script_Extensions=Latin}', description: 'Characters used by a script. Requires u or v flag.', example: '\\p{Script_Extensions=Latin}+' },
      { syntax: '\\p{Emoji}', description: 'Emoji property. Requires u or v flag.', example: '\\p{Emoji}+' },
      { syntax: '\\p{ASCII}', description: 'ASCII characters. Requires u or v flag.', example: '\\p{ASCII}+' },
      { syntax: '[\\p{Letter}&&\\p{Script=Latin}]', description: 'Class intersection. Requires v flag.', example: '[\\p{Letter}&&\\p{Script=Latin}]+' },
      { syntax: '[\\p{ASCII}--\\p{Number}]', description: 'Class subtraction. Requires v flag.', example: '[\\p{ASCII}--\\p{Number}]+' },
    ],
  },
  {
    id: 'anchors',
    title: 'Anchors and Boundaries',
    items: [
      { syntax: '^', description: 'Start of input, or start of line with m flag.', example: '^Subject' },
      { syntax: '$', description: 'End of input, or end of line with m flag.', example: 'done$' },
      { syntax: '\\b', description: 'Word boundary.', example: '\\bword\\b' },
      { syntax: '\\B', description: 'Not a word boundary.', example: '\\Bend' },
      { syntax: '(?=.)', description: 'Use lookahead as a custom boundary.', example: '\\d(?=px)' },
      { syntax: '(?<!.)', description: 'Use lookbehind as a custom boundary.', example: '(?<!-)\\d+' },
    ],
  },
  {
    id: 'quantifiers',
    title: 'Quantifiers',
    items: [
      { syntax: '*', description: 'Zero or more.', example: 'ab*' },
      { syntax: '+', description: 'One or more.', example: 'ab+' },
      { syntax: '?', description: 'Zero or one.', example: 'colou?r' },
      { syntax: '{n}', description: 'Exactly n times.', example: '\\d{4}' },
      { syntax: '{n,}', description: 'At least n times.', example: '\\d{2,}' },
      { syntax: '{n,m}', description: 'Between n and m times.', example: '\\d{2,4}' },
      { syntax: '*?', description: 'Lazy zero or more.', example: '<.*?>' },
      { syntax: '+?', description: 'Lazy one or more.', example: '".+?"' },
      { syntax: '??', description: 'Lazy zero or one.', example: 'colou??r' },
      { syntax: '{n,m}?', description: 'Lazy bounded quantifier.', example: '\\d{2,4}?' },
    ],
  },
  {
    id: 'groups',
    title: 'Groups and Alternation',
    items: [
      { syntax: '(...)', description: 'Capturing group.', example: '(foo|bar)' },
      { syntax: '(?:...)', description: 'Non-capturing group.', example: '(?:https?)://' },
      { syntax: '(?<name>...)', description: 'Named capturing group.', example: '(?<year>\\d{4})' },
      { syntax: '\\1', description: 'Backreference to capture group 1.', example: '(\\w+) \\1' },
      { syntax: '\\k<name>', description: 'Backreference to a named group.', example: '(?<tag>\\w+).*\\k<tag>' },
      { syntax: '|', description: 'Alternative.', example: 'cat|dog' },
      { syntax: '(a|b|c)', description: 'Scope alternatives with a group.', example: '\\b(cat|dog)\\b' },
      { syntax: '(?:ab)+', description: 'Repeat a grouped sequence.', example: '(?:ha)+' },
    ],
  },
  {
    id: 'lookarounds',
    title: 'Lookarounds',
    items: [
      { syntax: '(?=...)', description: 'Positive lookahead.', example: '\\w+(?=;)' },
      { syntax: '(?!...)', description: 'Negative lookahead.', example: 'foo(?!bar)' },
      { syntax: '(?<=...)', description: 'Positive lookbehind.', example: '(?<=#)\\w+' },
      { syntax: '(?<!...)', description: 'Negative lookbehind.', example: '(?<!-)\\d+' },
      { syntax: '^(?=.*a)', description: 'Require something later in the string.', example: '^(?=.*\\d).+$' },
      { syntax: '(?=.{8,}$)', description: 'Validate without consuming text.', example: '^(?=.{8,}$)(?=.*\\d)' },
    ],
  },
  {
    id: 'flags',
    title: 'Flags',
    items: [
      { syntax: 'g', description: 'Global search. Find all matches.', example: '/foo/g' },
      { syntax: 'i', description: 'Case-insensitive search.', example: '/foo/i' },
      { syntax: 'm', description: '^ and $ match line boundaries.', example: '/^title/m' },
      { syntax: 's', description: 'Dot also matches line breaks.', example: '/a.b/s' },
      { syntax: 'u', description: 'Unicode-aware matching.', example: '/\\p{Letter}+/u' },
      { syntax: 'v', description: 'Unicode sets mode with class operations.', example: '/[\\p{Letter}&&\\p{ASCII}]+/v' },
      { syntax: 'y', description: 'Sticky match from lastIndex.', example: '/\\w/y' },
      { syntax: 'd', description: 'Expose match indices when supported.', example: '/foo/d' },
    ],
  },
  {
    id: 'js-patterns',
    title: 'JavaScript Usage',
    items: [
      { syntax: '/pattern/flags', description: 'Regex literal syntax.', example: '/\\w+/gi' },
      { syntax: 'new RegExp()', description: 'Create from a string.', example: 'new RegExp("\\\\w+", "gi")' },
      { syntax: 'test()', description: 'Return true or false.', example: '/foo/.test(text)' },
      { syntax: 'match()', description: 'Return matches from a string.', example: 'text.match(/\\w+/g)' },
      { syntax: 'matchAll()', description: 'Return iterable match details. Needs g flag.', example: 'text.matchAll(/(\\w+)/g)' },
      { syntax: 'replace()', description: 'Replace matched text.', example: 'text.replace(/\\s+/g, " ")' },
      { syntax: 'split()', description: 'Split text by regex.', example: 'text.split(/[,;]\\s*/)' },
      { syntax: 'exec()', description: 'Read one match and capture groups.', example: '/(\\w+)/g.exec(text)' },
    ],
  },
  {
    id: 'replacement',
    title: 'Replacement Tokens',
    items: [
      { syntax: '$&', description: 'Entire matched text.', example: '"[$&]"' },
      { syntax: '$1', description: 'Capture group 1.', example: '"$1"' },
      { syntax: '$<name>', description: 'Named capture group.', example: '"$<year>"' },
      { syntax: '$`', description: 'Text before the match.', example: '"$`"' },
      { syntax: "$'", description: 'Text after the match.', example: '"$\'"' },
      { syntax: '$$', description: 'Literal dollar sign.', example: '"$$"' },
    ],
  },
  {
    id: 'recipes',
    title: 'Common Recipes',
    items: [
      { syntax: '^\\s+|\\s+$', description: 'Leading or trailing whitespace.', example: '^\\s+|\\s+$' },
      { syntax: '\\s+', description: 'Collapse repeated whitespace.', example: '\\s+' },
      { syntax: '\\b\\w+\\b', description: 'Simple word tokens.', example: '\\b\\w+\\b' },
      { syntax: 'https?:\\/\\/\\S+', description: 'Simple URL matcher.', example: 'https?:\\/\\/\\S+' },
      { syntax: '[^,\\n]+', description: 'Simple comma-separated field.', example: '[^,\\n]+' },
      { syntax: '<([a-z][\\w-]*)\\b[^>]*>', description: 'Simple opening HTML tag.', example: '<([a-z][\\w-]*)\\b[^>]*>' },
    ],
  },
];
