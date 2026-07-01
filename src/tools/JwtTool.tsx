import { useMemo, useState } from 'react';
import { Copy, Eraser, KeyRound, ShieldAlert } from 'lucide-react';
import { Field } from '../components/Field';
import { Stat } from '../components/Stat';
import { ToolbarButton } from '../components/ToolbarButton';
import { copyText } from '../utils/clipboard';
import { decodeJwt, type DecodedJwt } from '../utils/jwt';

const sampleJwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0b29scy1odWIiLCJzdWIiOiJ1c2VyLTEyMyIsImF1ZCI6ImRlbW8iLCJpYXQiOjE3ODI4OTI4MDAsImV4cCI6MTc4Mjg5NjQwMCwicm9sZSI6ImFkbWluIn0.5iUx9ME8n6loO2qDkLCZ_DemoSignatureOnly';

function getAlgorithm(decoded: DecodedJwt | null) {
  if (!decoded || !decoded.header || typeof decoded.header !== 'object' || Array.isArray(decoded.header)) return '-';
  const algorithm = decoded.header.alg;
  return typeof algorithm === 'string' ? algorithm : '-';
}

function getType(decoded: DecodedJwt | null) {
  if (!decoded || !decoded.header || typeof decoded.header !== 'object' || Array.isArray(decoded.header)) return '-';
  const type = decoded.header.typ;
  return typeof type === 'string' ? type : '-';
}

function JwtTool() {
  const [token, setToken] = useState(sampleJwt);
  const [decoded, setDecoded] = useState<DecodedJwt | null>(() => decodeJwt(sampleJwt));
  const [error, setError] = useState('');

  const tokenParts = useMemo(() => token.trim().split('.').filter(Boolean), [token]);

  function runDecode() {
    try {
      setDecoded(decodeJwt(token));
      setError('');
    } catch (decodeError) {
      setDecoded(null);
      setError(decodeError instanceof Error ? decodeError.message : 'Unable to decode JWT.');
    }
  }

  function clearJwt() {
    setToken('');
    setDecoded(null);
    setError('');
  }

  return (
    <section className="tool-surface">
      <Field label="JWT">
        <textarea value={token} onChange={(event) => setToken(event.target.value)} spellCheck={false} />
      </Field>

      <div className="action-bar">
        <ToolbarButton title="Decode JWT" variant="primary" onClick={runDecode}>
          <KeyRound size={16} />
          <span>Decode</span>
        </ToolbarButton>
        <ToolbarButton title="Copy header JSON" disabled={!decoded} onClick={() => copyText(decoded?.headerText ?? '')}>
          <Copy size={16} />
          <span>Header</span>
        </ToolbarButton>
        <ToolbarButton title="Copy payload JSON" disabled={!decoded} onClick={() => copyText(decoded?.payloadText ?? '')}>
          <Copy size={16} />
          <span>Payload</span>
        </ToolbarButton>
        <ToolbarButton title="Clear JWT" disabled={!token && !decoded && !error} onClick={clearJwt}>
          <Eraser size={16} />
          <span>Clear</span>
        </ToolbarButton>
      </div>

      <div className="notice warning">
        <ShieldAlert size={16} />
        <span>Decode only. Signature verification is not performed.</span>
      </div>
      {error ? <div className="notice error">{error}</div> : null}

      <div className="metrics-row">
        <Stat label="Parts" value={tokenParts.length} />
        <Stat label="Algorithm" value={getAlgorithm(decoded)} />
        <Stat label="Type" value={getType(decoded)} />
        <Stat label="Signature" value={decoded?.signature ? 'Present' : '-'} />
      </div>

      {decoded ? (
        <>
          {decoded.claims.length > 0 ? (
            <div className="jwt-claims">
              {decoded.claims.map((claim) => (
                <div className="jwt-claim" key={claim.label}>
                  <span>{claim.label}</span>
                  <strong>{claim.value}</strong>
                </div>
              ))}
            </div>
          ) : null}
          <div className="output-grid">
            <Field label="Header">
              <textarea className="result-output" value={decoded.headerText} readOnly spellCheck={false} />
            </Field>
            <Field label="Payload">
              <textarea className="result-output" value={decoded.payloadText} readOnly spellCheck={false} />
            </Field>
            <Field label="Signature">
              <textarea className="result-output" value={decoded.signaturePreview} readOnly spellCheck={false} />
            </Field>
          </div>
        </>
      ) : null}
    </section>
  );
}

export { JwtTool };
