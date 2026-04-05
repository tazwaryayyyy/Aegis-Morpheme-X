import React, { useState, useEffect } from 'react';

const MorphemeCard = ({ morpheme, isNew }) => {
  const [displayText, setDisplayText] = useState('');

  // Matrix-style decode effect around the text
  useEffect(() => {
    if (isNew && morpheme) {
      const target = morpheme?.morpheme_id || '00000000';
      let iter = 0;
      const interval = setInterval(() => {
        setDisplayText(target.split('').map((char, index) => {
          if (index < iter) return char;
          return String.fromCharCode(33 + Math.random() * 94);
        }).join(''));
        iter += 1/3;
        if (iter >= target.length) clearInterval(interval);
      }, 30);
      return () => clearInterval(interval);
    } else if (morpheme) {
      setDisplayText(morpheme?.morpheme_id || '00000000');
    }
  }, [morpheme, isNew]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
            {(morpheme?.morpheme_id || '00000000').slice(-8)}
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
              <span className="dense-val text-cyan" style={{ fontSize: 10 }}>
                {(morpheme?.hedera_tx_id || '0.0.0@0.0').slice(0, 20)}...
              </span>
            </div>
            <div className="dense-row">
              <span className="dense-label">TIMESTAMP</span>
              <span className="dense-val">{new Date(morpheme.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="dense-row">
              <span className="dense-label">RISK_SNAP</span>
              <span className="dense-val text-cyan">
                {morpheme?.data_snapshot?.risk_score?.toFixed(3) || '0.000'}
              </span>
            </div>
            <div className="dense-row">
              <span className="dense-label">TRIAGE</span>
              <span className="dense-val" style={{ color: 'var(--orange)' }}>
                {morpheme?.data_snapshot?.triage_decision || 'NULL'}
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
             <div><span className="json-key">"morpheme_id":</span> <span className="json-str">"{displayText}"</span>,</div>
             <div><span className="json-key">"hedera_tx_id":</span> <span className="json-str">"{morpheme.hedera_tx_id}"</span>,</div>
             <div>
               <span className="json-key">"agents":</span> <span className="json-str">"{morpheme.data_snapshot.triage_decision ? 'triage, ' : ''}{morpheme.data_snapshot.diagnosis_decision ? 'diagnosis' : ''}"</span>
             </div>
           </div>
           <div style={{ color: 'var(--cyan)', marginTop: 8 }}>{'}'}</div>
        </div>
      )}
    </div>
  );
};

export default MorphemeCard;
