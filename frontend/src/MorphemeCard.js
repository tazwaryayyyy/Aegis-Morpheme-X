/**
 * AMX Protocol – Morpheme-X Card Component
 * Displays the Executable Morpheme-X with lock animation and Hedera explorer link.
 */

import React, { useState, useEffect } from 'react';

function syntaxHighlight(json) {
  if (!json) return '';
  const str = JSON.stringify(json, null, 2);
  return str.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'json-num';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'json-key' : 'json-str';
      } else if (/true|false/.test(match)) {
        cls = 'json-bool';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export default function MorphemeCard({ morpheme, isNew }) {
  const [locking, setLocking] = useState(false);

  useEffect(() => {
    if (isNew && morpheme?.confirmed && !morpheme?.fallback) {
      setLocking(true);
      const t = setTimeout(() => setLocking(false), 600);
      return () => clearTimeout(t);
    }
  }, [isNew, morpheme]);

  const confirmed = morpheme?.confirmed;
  const isFallback = morpheme?.fallback;
  const isLocking = confirmed && !isFallback;
  const txId = morpheme?.hedera_tx_id;
  const explorerUrl = morpheme?.explorer_url;

  // Build display copy (without internal keys)
  const displayMorpheme = morpheme
    ? {
        intent_hash:       morpheme.intent_hash,
        model_snapshot:    morpheme.model_snapshot_hash,
        context_fp:        morpheme.context_fingerprint,
        risk_score:        morpheme.risk_score,
        triage:            morpheme.triage,
        diagnosis:         morpheme.diagnosis,
        outbreak_risk:     morpheme.outbreak_risk,
        payout_threshold:  morpheme.payout_threshold,
        insurance_trigger: morpheme.insurance_trigger,
        payout_amount:     morpheme.payout_amount,
        trigger:           morpheme.trigger,
        hedera_tx_id:      morpheme.hedera_tx_id,
        consensus_ts:      morpheme.consensus_timestamp,
      }
    : null;

  return (
    <div className={`card morpheme-card ${confirmed ? 'confirmed' : ''}`}>
      {/* Header */}
      <div className="morpheme-header">
        <div className="card-title">
          <div className="card-title-icon" style={{ background: 'rgba(0,255,163,0.1)' }}>🧬</div>
          Executable Morpheme-X
        </div>
        <div className={`morpheme-lock ${confirmed ? (isFallback ? 'fallback' : 'locked') : 'unlocked'}`}>
          <span className={`lock-icon ${isLocking ? 'locking' : ''}`}>
            {confirmed ? (isFallback ? '⚠️' : '🔒') : '🔓'}
          </span>
          <span style={{ fontSize: 12 }}>
            {confirmed ? (isFallback ? '⚠️ FALLBACK MODE' : 'ON-CHAIN VERIFIED') : 'AWAITING SUBMISSION'}
          </span>
        </div>
      </div>

      {/* Trust proof */}
      {confirmed && (
        <div className="trust-pill mb-8" style={{ marginBottom: 12 }}>
          ✅ Immutable · Auditable · Cannot Be Altered
        </div>
      )}

      {/* TX ID row */}
      {txId && (
        <div className="tx-id-row">
          <span className="tx-id-label">TX ID</span>
          <span className="tx-id-value">{txId}</span>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-explorer-link"
              title="View on HashScan"
            >
              HashScan ↗
            </a>
          )}
        </div>
      )}

      {/* JSON viewer */}
      {displayMorpheme ? (
        <div
          className="morpheme-json"
          dangerouslySetInnerHTML={{ __html: syntaxHighlight(displayMorpheme) }}
        />
      ) : (
        <div className="morpheme-json" style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⬡</div>
          <div>No Morpheme-X yet. Run a simulation to create one.</div>
        </div>
      )}
    </div>
  );
}
