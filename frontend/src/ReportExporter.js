import React, { useState } from 'react';

const ReportExporter = ({ morpheme, events, cityConfig, agentStakes, anomalyData }) => {
  const [generating, setGenerating] = useState(false);
  const [done,        setDone]       = useState(false);

  const buildHTML = (data) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AMX Protocol Report</title>
  <style>
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      margin: 0; 
      background: #ffffff; 
      color: #0a0a0a; 
      line-height: 1.5; 
      font-size: 13px; 
    }
    .mono { font-family: 'Courier New', Courier, monospace; }
    
    .header-bar {
      background: #04080f;
      color: #ffffff;
      padding: 24px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #00ff88;
    }
    .header-title { font-weight: 600; font-size: 16px; letter-spacing: 1px; }
    .header-meta { font-size: 11px; opacity: 0.6; text-align: right; }
    
    .container {
      max-width: 900px;
      margin: 40px auto;
      padding: 0 40px;
    }

    .section { 
      background: #ffffff;
      margin: 0 0 32px 0; 
      border: 1px solid #e5e5e5; 
      border-radius: 12px; 
      padding: 24px; 
      position: relative;
    }
    .section-title { 
      font-size: 11px; 
      font-weight: 600; 
      margin-bottom: 20px; 
      color: #666666; 
      text-transform: uppercase; 
      letter-spacing: 1.5px;
    }

    .dense-row { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start;
      border-bottom: 1px solid #f0f0f0; 
      padding: 12px 0; 
    }
    .dense-row:last-child { border-bottom: none; padding-bottom: 0; }
    .label { color: #999999; font-size: 12px; }
    .value { font-weight: 500; }

    .event-item { 
      margin: 0; 
      padding: 12px 0; 
      border-bottom: 1px solid #f0f0f0; 
    }
    .event-item:last-child { border-bottom: none; }

    .btn { 
      display: inline-block;
      padding: 6px 16px;
      border: 1px solid #d0d0d0;
      border-radius: 20px;
      color: #0a0a0a;
      text-decoration: none;
      font-size: 11px;
      font-weight: 500;
      background: #f8f8f8;
    }
    .btn:hover { background: #f0f0f0; }
    
    .stamp {
      position: absolute;
      top: 24px;
      right: 24px;
      border: 2px solid #0a0a0a;
      color: #0a0a0a;
      padding: 4px 12px;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 2px;
      text-transform: uppercase;
      transform: rotate(12deg);
      opacity: 0.8;
    }
    .stamp.unverified { border-color: #ff3333; color: #ff3333; }
    
    .footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 24px;
      border-top: 1px solid #e5e5e5;
      color: #999999;
      font-size: 10px;
    }

    @media print {
      body { background: #fff; }
      .container { padding: 0; }
      .section { break-inside: avoid; border: 1px solid #ccc; }
      .header-bar { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div class="header-title">AEGIS MORPHEME-X</div>
    <div class="header-meta mono">
      GEN: ${data.timestamp}<br>
      NET: ${data.systemInfo.network}
    </div>
  </div>

  <div class="container">
    <div class="section">
      <div class="section-title">Geographic Layer</div>
      ${data.city?.name ? `
      <div class="dense-row"><span class="label">CITY</span><span class="value">${data.city.name.toUpperCase()}</span></div>
      <div class="dense-row"><span class="label">POPULATION</span><span class="value">${data.city.population}</span></div>
      <div class="dense-row"><span class="label">AQI_AVG</span><span class="value">${data.city.aqi_avg}</span></div>
      <div class="dense-row"><span class="label">POV_IDX</span><span class="value">${(data.city.poverty_index * 100).toFixed(1)}%</span></div>
      ` : '<div class="label">NO GEO DATA CAPTURED</div>'}
    </div>

    <div class="section">
      <div class="section-title">HCS Executable Morpheme-X</div>
      ${data.morpheme ? `
      <div class="stamp ${data.morpheme.confirmed ? '' : 'unverified'}">
        ${data.morpheme.confirmed ? 'VERIFIED' : 'UNVERIFIED'}
      </div>
      <div class="dense-row"><span class="label">INTENT_HASH</span><span class="value mono">${data.morpheme.intent_hash}</span></div>
      <div class="dense-row"><span class="label">RISK_SCORE</span><span class="value">${data.morpheme.risk_score}</span></div>
      <div class="dense-row"><span class="label">TRIAGE</span><span class="value">${data.morpheme.triage}</span></div>
      <div class="dense-row"><span class="label">IS_BLOCKED</span><span class="value">${data.morpheme.blocked ? 'TRUE' : 'FALSE'}</span></div>
      ${data.morpheme.hedera_tx_id ? `<div style="margin-top:20px;"><a href="${data.morpheme.explorer_url}" target="_blank" class="btn">View on HashScan &rarr;</a></div>` : ''}
      ` : '<div class="label">NO MORPHEME SEALED IN CURRENT SESSION</div>'}
    </div>

    <div class="section">
      <div class="section-title">HTS Balances (AMXSTAKE)</div>
      ${data.agentStakes
        ? Object.entries(data.agentStakes).map(([a, s]) => `<div class="dense-row"><span class="label">${a.toUpperCase()}</span><span class="value">${s}</span></div>`).join('')
        : '<div class="label">NO STAKE DATA AVAILABLE</div>'}
    </div>

    <div class="section">
      <div class="section-title">Execution Audit Trail</div>
      ${data.events.length > 0
        ? data.events.map(e => `<div class="event-item"><span class="label mono" style="margin-right:12px;">[${new Date(e._ts || Date.now()).toISOString()}]</span> <strong>${e.type.toUpperCase()}</strong>: ${e.reasoning || e.decision || e.agent || 'null'}</div>`).join('')
        : '<div class="label">NO LOGS CAPTURED</div>'}
    </div>

    <div class="footer">
      Generated by AegisMorpheme-X Protocol &middot; Hedera Testnet &middot; Not financial or medical advice
    </div>
  </div>
</body>
</html>`;

  const generate = async () => {
    setGenerating(true);
    try {
      const data    = {
        timestamp:  new Date().toISOString(),
        city:       cityConfig,
        morpheme,
        events:     (events || []).slice(0, 50),
        agentStakes,
        anomalyData,
        systemInfo: { version: '1.0.0', network: 'Hedera Testnet' },
      };
      const html    = buildHTML(data);
      const blob    = new Blob([html], { type: 'text/html' });
      const url     = URL.createObjectURL(blob);
      const link    = document.createElement('a');
      link.href     = url;
      link.download = `amx-audit-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      console.error('[ReportExporter]', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <div className="card-header">
        <div className="card-title">[TXT] Audit Report</div>
      </div>
      <div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 16 }}>
          {'>'} COMPILE SYSTEM AUDIT LOG TO RAW HTML
        </div>
        <button
          className="magnetic-btn"
          onClick={generate}
          disabled={generating}
          style={{ 
            width: '100%', 
            padding: '12px', 
            border: '1px solid var(--cyan)', 
            background: 'rgba(0,229,255,0.05)', 
            color: 'var(--cyan)',
            fontFamily: 'var(--font-mono)', 
            fontSize: 11, 
            letterSpacing: 2,
            cursor: 'none', // Uses our custom cursor
            transition: 'all 0.25s ease', 
            textShadow: '0 0 4px rgba(0,229,255,0.2)',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '2px'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,229,255,0.15)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,229,255,0.05)' }}
        >
          {generating ? (
            <span>GENERATING...</span>
          ) : done ? (
            <span style={{ color: 'var(--acid)', textShadow: '0 0 4px rgba(200,255,0,0.3)' }}>[ OK ] EXPORTED</span>
          ) : (
            <span>EXECUTE EXPORT</span>
          )}
        </button>
      </div>
    </>
  );
};

export default ReportExporter;
