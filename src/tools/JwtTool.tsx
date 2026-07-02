import { useMemo, useState } from 'react';
import { Eraser, KeyRound, ShieldAlert } from 'lucide-react';
import { CopyButton } from '../components/CopyButton';
import { Stat } from '../components/Stat';
import { TextAreaField } from '../components/TextAreaField';
import { ToolbarButton } from '../components/ToolbarButton';
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
      <TextAreaField label="JWT" value={token} onChange={setToken} spellCheck={false} />

      <div className="action-bar">
        <ToolbarButton title="Decode JWT" variant="primary" onClick={runDecode}>
          <KeyRound size={16} />
          <span>Decode</span>
        </ToolbarButton>
        <CopyButton title="Copy header JSON" value={decoded?.headerText ?? ''} label="Header" disabled={!decoded} />
        <CopyButton title="Copy payload JSON" value={decoded?.payloadText ?? ''} label="Payload" disabled={!decoded} />
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
            <TextAreaField label="Header" value={decoded.headerText} readOnly spellCheck={false} className="result-output" />
            <TextAreaField label="Payload" value={decoded.payloadText} readOnly spellCheck={false} className="result-output" />
            <TextAreaField label="Signature" value={decoded.signaturePreview} readOnly spellCheck={false} className="result-output" />
          </div>
        </>
      ) : null}
    </section>
  );
}

export { JwtTool };
