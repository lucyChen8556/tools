import type { JsonDiff, JsonMergeMode, JsonValue } from '../types';

export function cleanJsonInput(input: string) {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

export function parseJson(input: string): JsonValue {
  return JSON.parse(cleanJsonInput(input)) as JsonValue;
}

export function isPlainObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function sortJson(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sortJson);
  if (!isPlainObject(value)) return value;

  return Object.keys(value)
    .sort((a, b) => a.localeCompare(b))
    .reduce<{ [key: string]: JsonValue }>((sorted, key) => {
      sorted[key] = sortJson(value[key]);
      return sorted;
    }, {});
}

export function cloneJson<T extends JsonValue>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function formatJson(value: JsonValue) {
  return JSON.stringify(sortJson(value), null, 2);
}

export function jsonType(value: JsonValue) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

export function diffJson(before: JsonValue, after: JsonValue, path: Array<string | number> = []): JsonDiff[] {
  const beforeType = jsonType(before);
  const afterType = jsonType(after);

  if (beforeType !== afterType) {
    return [{ path, type: 'type', before, after }];
  }

  if (Array.isArray(before) && Array.isArray(after)) {
    const diffs: JsonDiff[] = [];
    if (before.length !== after.length) {
      diffs.push({ path, type: 'array-length', before: before.length, after: after.length });
    }

    const max = Math.max(before.length, after.length);
    for (let index = 0; index < max; index += 1) {
      if (index >= before.length) {
        diffs.push({ path: [...path, index], type: 'added', after: after[index] });
      } else if (index >= after.length) {
        diffs.push({ path: [...path, index], type: 'removed', before: before[index] });
      } else {
        diffs.push(...diffJson(before[index], after[index], [...path, index]));
      }
    }
    return diffs;
  }

  if (isPlainObject(before) && isPlainObject(after)) {
    const diffs: JsonDiff[] = [];
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    Array.from(keys)
      .sort((a, b) => a.localeCompare(b))
      .forEach((key) => {
        if (!(key in before)) {
          diffs.push({ path: [...path, key], type: 'added', after: after[key] });
        } else if (!(key in after)) {
          diffs.push({ path: [...path, key], type: 'removed', before: before[key] });
        } else {
          diffs.push(...diffJson(before[key], after[key], [...path, key]));
        }
      });
    return diffs;
  }

  if (before !== after) {
    return [{ path, type: 'changed', before, after }];
  }

  return [];
}

export function pathLabel(path: Array<string | number>) {
  if (path.length === 0) return '$';
  return `$${path
    .map((part) => (typeof part === 'number' ? `[${part}]` : `.${part}`))
    .join('')}`;
}

export function compactJson(value: JsonValue | undefined) {
  if (value === undefined) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

export function getJsonAtPath(root: JsonValue, path: Array<string | number>) {
  let current: JsonValue | undefined = root;
  for (const part of path) {
    if (Array.isArray(current) && typeof part === 'number') {
      current = current[part];
    } else if (isPlainObject(current) && typeof part === 'string') {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

export function setJsonAtPath(root: JsonValue, path: Array<string | number>, value: JsonValue) {
  if (path.length === 0) return value;

  let current = root;
  path.forEach((part, index) => {
    const last = index === path.length - 1;
    if (last) {
      if (Array.isArray(current) && typeof part === 'number') current[part] = value;
      if (isPlainObject(current) && typeof part === 'string') current[part] = value;
      return;
    }

    if (Array.isArray(current) && typeof part === 'number') {
      current = current[part];
    } else if (isPlainObject(current) && typeof part === 'string') {
      current = current[part];
    }
  });

  return root;
}

export function mergeJsonObjects(before: JsonValue, after: JsonValue): JsonValue {
  if (Array.isArray(before) || Array.isArray(after)) return cloneJson(after);
  if (!isPlainObject(before) || !isPlainObject(after)) return cloneJson(after);

  const merged: { [key: string]: JsonValue } = cloneJson(before);
  Object.entries(after).forEach(([key, value]) => {
    merged[key] = key in merged ? mergeJsonObjects(merged[key], value) : cloneJson(value);
  });
  return sortJson(merged);
}

export function mergeJsonByDiff(before: JsonValue, after: JsonValue, mode: JsonMergeMode) {
  if (mode === 'full') return mergeJsonObjects(before, after);

  const merged = cloneJson(before);
  const diffs = diffJson(before, after);

  diffs.forEach((diff) => {
    const canApplyValue =
      mode === 'diff' ||
      (mode === 'value' &&
        diff.type === 'changed' &&
        !isPlainObject(diff.before ?? null) &&
        !Array.isArray(diff.before) &&
        !isPlainObject(diff.after ?? null) &&
        !Array.isArray(diff.after));

    if (canApplyValue) {
      const nextValue = getJsonAtPath(after, diff.path);
      if (nextValue !== undefined) setJsonAtPath(merged, diff.path, cloneJson(nextValue));
    }
  });

  return sortJson(merged);
}
