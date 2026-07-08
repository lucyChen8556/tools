const hashAlgorithms = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;

type HashAlgorithm = (typeof hashAlgorithms)[number];

const hashDefaults = {
  input: 'hello world',
};

type HashResult = {
  algorithm: HashAlgorithm;
  value: string;
};

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function buildHashResults(input: string) {
  const payload = new TextEncoder().encode(input);
  return Promise.all(
    hashAlgorithms.map(async (algorithm) => ({
      algorithm,
      value: toHex(await crypto.subtle.digest(algorithm, payload)),
    })),
  );
}

export { buildHashResults, hashAlgorithms, hashDefaults };
export type { HashResult };
