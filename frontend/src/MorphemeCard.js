import React, { useState, useEffect } from 'react';

const MorphemeCard = ({ morpheme, isNew, onVerify }) => {
  const [displayText, setDisplayText] = useState('');
  const [loading, setLoading] = useState(false);

  // Matrix-style decode effect around the intent_hash
  useEffect(() => {
    if (isNew && morpheme) {
      const target = (morpheme?.intent_hash || '00000000').slice(0, 16);
      let iter = 0;
      const interval = setInterval(() => {
        setDisplayText(
          target.split('').map((char, index) => {
            if (index < iter) return char;
            return String.fromCharCode(33 + Math.random() * 94);
          }).join('')
        );
        iter += 1 / 3;
        if (iter >= target.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    } else if (morpheme) {
      setDisplayText((morpheme?.intent_hash || '00000000').slice(0, 16));
    }
  }, [morpheme, isNew]);

  const handleVerify = () => {
    if (loading) return;
    setLoading(true);

    setTimeout(() => {
      // BUGFIX: If TX is simulated, link to HCS topic page instead
      let url = morpheme.explorer_url;
      if (morpheme.hedera_tx_id && morpheme.hedera_tx_id.startsWith('SIMULATED_')) {
        url = 'https://hashscan.io/testnet/topic/0.0.4982301';
      }
      window.open(url, '_blank');
      setLoading(false);
      if (typeof onVerify === 'function') onVerify();
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <style>{`
        @keyframes oh-spin {
          to { transform: rotate(360deg); }
        }
        .loading-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(170, 255, 0, 0.2);
          border-top-color: var(--acid);
          border-radius: 50%;
          animation: oh-spin 0.6s linear infinite;
        }
      `}</style>

      {/* Dynamic Header */}
      {morpheme ? (
        <div style={{
          background: 'rgba(0,229,255,0.08)',
          borderBottom: '1px solid rgba(0,229,255,0.2)',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'background 0.3s'
        }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--cyan)' }}>
            [M] SEALED_MORPHEME
          </div>
          <div style={{ fontSize: 9, color: 'rgba(0,229,255,0.4)', letterSpacing: 1 }}>
            {/* Show lock icon when confirmed */}
            {morpheme.confirmed ? '🔒 ' : ''}{(morpheme?.intent_hash || '00000000').slice(-8)}
          </div>
        </div>
      ) : (
        <div style={{
          background: 'transparent',
          borderBottom: '1px solid var(--border)',
          padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            [M] MORPHEME_TARGET
          </div>
        </div>
      )}

      {/* Content Area */}
      <div style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {morpheme ? (
          <div className="gap-stack">
            <div className="dense-row">
              <span className="dense-label">TX_HASH</span>
              {morpheme?.explorer_url ? (
                <span className="dense-val text-cyan" style={{ fontSize: 10 }}>
                  {(morpheme?.hedera_tx_id || '0.0.0@0.0').slice(0, 20)}...
                </span>
              ) : (
                <span className="dense-val text-cyan" style={{ fontSize: 10 }}>
                  {(morpheme?.hedera_tx_id || '0.0.0@0.0').slice(0, 20)}...
                </span>
              )}
            </div>
            <div className="dense-row">
              <span className="dense-label">TIMESTAMP</span>
              <span className="dense-val">
                {morpheme.timestamp
                  ? new Date(morpheme.timestamp * 1000).toLocaleTimeString()
                  : '—'}
              </span>
            </div>
            <div className="dense-row">
              <span className="dense-label">RISK_SNAP</span>
              <span className="dense-val text-cyan">
                {typeof morpheme?.risk_score === 'number'
                  ? morpheme.risk_score.toFixed(3)
                  : '0.000'}
              </span>
            </div>
            <div className="dense-row">
              <span className="dense-label">TRIAGE</span>
              <span className="dense-val" style={{ color: 'var(--orange)' }}>
                {morpheme?.triage || 'NULL'}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{
              fontSize: 10, fontFamily: 'var(--font-mono)',
              color: 'rgba(255,255,255,0.3)',
              textAlign: 'center',
              letterSpacing: '0.12em'
            }}>
              {'>'} UNSEALED — NO MORPHEME COMMITTED
            </div>
          </div>
        )}
      </div>

      {/* JSON Dropdown if active */}
      {morpheme && (
        <div className="morpheme-json" style={{ borderTop: 'none', borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>
          <div style={{ color: 'var(--cyan)', marginBottom: 8 }}>{'{'}</div>
          <div style={{ paddingLeft: 16 }}>
            <div>
              <span className="json-key">"intent_hash":</span>{' '}
              <span className="json-str">"{displayText}..."</span>,
            </div>
            <div>
              <span className="json-key">"hedera_tx_id":</span>{' '}
              <span className="json-str">"{morpheme.hedera_tx_id}"</span>,
            </div>
            <div>
              <span className="json-key">"triage":</span>{' '}
              <span className="json-str">"{morpheme.triage || ''}"</span>,
            </div>
            <div>
              <span className="json-key">"diagnosis":</span>{' '}
              <span className="json-str">"{(morpheme.diagnosis || '').slice(0, 40)}..."</span>
            </div>
          </div>
          <div style={{ color: 'var(--cyan)', marginTop: 8 }}>{'}'}</div>
        </div>
      )}

      {/* BUGFIX: Upgrade 3 - HashScan Prominence Button */}
      {morpheme && (
        <div style={{ padding: '0 20px 20px' }}>
          <button
            className="magnetic-btn"
            onClick={handleVerify}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? 'rgba(170, 255, 0, 0.02)' : 'rgba(170, 255, 0, 0.05)',
              border: `1px solid ${loading ? 'rgba(170, 255, 0, 0.2)' : 'var(--acid)'}`,
              borderRadius: '4px',
              color: loading ? 'rgba(170, 255, 0, 0.5)' : 'var(--acid)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 'bold',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              pointerEvents: loading ? 'none' : 'auto',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (loading) return;
              e.currentTarget.style.background = 'rgba(170, 255, 0, 0.12)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(170, 255, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              if (loading) return;
              e.currentTarget.style.background = 'rgba(170, 255, 0, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {loading ? (
              <div className="loading-spinner" />
            ) : (
              <>
                <span>VERIFY ON HEDERA</span>
                <span style={{ fontSize: '14px' }}>↗</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MorphemeCard;
