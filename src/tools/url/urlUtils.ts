type QueryRow = {
  id: string;
  key: string;
  value: string;
};

const urlDefaults = {
  input: 'https://example.com/docs?page=1&sort=desc#intro',
};

function parseUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { url: null, error: 'Enter a URL', relative: false };

  try {
    return { url: new URL(trimmed), error: '', relative: false };
  } catch {
    try {
      return { url: new URL(trimmed, 'https://example.com'), error: '', relative: true };
    } catch (error) {
      return { url: null, error: error instanceof Error ? error.message : 'Invalid URL', relative: false };
    }
  }
}

function rowsFromUrl(url: URL | null) {
  if (!url) return [];
  return Array.from(url.searchParams.entries()).map(([key, value], index) => ({
    id: `${index}-${key}-${value}`,
    key,
    value,
  }));
}

function buildUrl(url: URL | null, rows: QueryRow[], relative: boolean) {
  if (!url) return '';
  const next = new URL(url.toString());
  next.search = '';
  rows.forEach((row) => {
    if (row.key.trim()) next.searchParams.append(row.key, row.value);
  });
  return relative ? `${next.pathname}${next.search}${next.hash}` : next.toString();
}

function sortQueryRows(rows: QueryRow[]) {
  return [...rows].sort((left, right) => {
    const keyCompare = left.key.localeCompare(right.key);
    return keyCompare === 0 ? left.value.localeCompare(right.value) : keyCompare;
  });
}

function removeEmptyQueryRows(rows: QueryRow[]) {
  return rows.filter((row) => row.key.trim() && row.value.trim());
}

export { buildUrl, parseUrl, removeEmptyQueryRows, rowsFromUrl, sortQueryRows, urlDefaults };
export type { QueryRow };
