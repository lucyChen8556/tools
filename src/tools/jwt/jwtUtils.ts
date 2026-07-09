import type { JsonValue } from '@/types';

export type JwtClaimInfo = {
  label: string;
  value: string;
};

export type DecodedJwt = {
  header: JsonValue;
  payload: JsonValue;
  signature: string;
  headerText: string;
  payloadText: string;
  signaturePreview: string;
  claims: JwtClaimInfo[];
};

const sampleJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0b29scy1odWIiLCJzdWIiOiJ1c2VyLTEyMyIsImF1ZCI6ImRlbW8iLCJpYXQiOjE3ODI4OTI4MDAsImV4cCI6MTc4Mjg5NjQwMCwicm9sZSI6ImFkbWluIn0.5iUx9ME8n6loO2qDkLCZ_DemoSignatureOnly';

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function parseJwtPart(value: string) {
  return JSON.parse(decodeBase64Url(value)) as JsonValue;
}

function formatUnixClaim(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  return new Date(value * 1000).toLocaleString();
}

function getObjectValue(value: JsonValue, key: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return value[key];
}

function buildClaimInfo(payload: JsonValue): JwtClaimInfo[] {
  const claimLabels = [
    { key: 'iss', label: 'Issuer' },
    { key: 'sub', label: 'Subject' },
    { key: 'aud', label: 'Audience' },
    { key: 'exp', label: 'Expires' },
    { key: 'nbf', label: 'Not before' },
    { key: 'iat', label: 'Issued at' },
    { key: 'jti', label: 'JWT ID' },
  ];

  return claimLabels.flatMap(({ key, label }) => {
    const value = getObjectValue(payload, key);
    if (value === undefined) return [];

    const formattedTime = ['exp', 'nbf', 'iat'].includes(key) ? formatUnixClaim(value) : '';
    const displayValue = formattedTime || (typeof value === 'string' ? value : JSON.stringify(value));

    return [{ label, value: displayValue }];
  });
}

export function decodeJwt(token: string): DecodedJwt {
  const normalizedToken = token.trim();
  const parts = normalizedToken.split('.');

  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    throw new Error('JWT must contain header, payload, and signature parts.');
  }

  const [headerPart, payloadPart, signature] = parts;
  const header = parseJwtPart(headerPart);
  const payload = parseJwtPart(payloadPart);
  const signaturePreview = signature.length > 24 ? `${signature.slice(0, 12)}...${signature.slice(-12)}` : signature;

  return {
    header,
    payload,
    signature,
    headerText: JSON.stringify(header, null, 2),
    payloadText: JSON.stringify(payload, null, 2),
    signaturePreview,
    claims: buildClaimInfo(payload),
  };
}

export function getJwtAlgorithm(decoded: DecodedJwt | null) {
  if (!decoded || !decoded.header || typeof decoded.header !== 'object' || Array.isArray(decoded.header)) return '-';
  const algorithm = decoded.header.alg;
  return typeof algorithm === 'string' ? algorithm : '-';
}

export function getJwtType(decoded: DecodedJwt | null) {
  if (!decoded || !decoded.header || typeof decoded.header !== 'object' || Array.isArray(decoded.header)) return '-';
  const type = decoded.header.typ;
  return typeof type === 'string' ? type : '-';
}

export { sampleJwt };
