/**
 * AMX Protocol - Professional Demo Report Exporter
 * Generates comprehensive PDF reports for judges to take home
 */

import React, { useState } from 'react';

const ReportExporter = ({ 
  morpheme, 
  events, 
  cityConfig, 
  agentStakes,
  anomalyData 
}) => {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateReport = async () => {
    setGenerating(true);
    
    try {
      // Create a comprehensive report object
      const reportData = {
        timestamp: new Date().toISOString(),
        city: cityConfig,
        morpheme: morpheme,
        events: events.slice(0, 20), // Last 20 events
        agentStakes: agentStakes,
        anomalyData: anomalyData,
        systemInfo: {
          version: '1.0.0',
          network: 'Hedera Testnet',
          protocol: 'AegisMorpheme-X'
        }
      };

      // Generate HTML content for the report
      const htmlContent = generateReportHTML(reportData);
      
      // Create and download the report
      await downloadReport(htmlContent, reportData);
      
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
      
    } catch (error) {
      console.error('Report generation failed:', error);
    } finally {
      setGenerating(false);
    }
  };

  const generateReportHTML = (data) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AMX Protocol Demo Report</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #0a0f1e; 
            color: #ffffff; 
            line-height: 1.6;
        }
        .header { 
            text-align: center; 
            border-bottom: 2px solid #00e5ff; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
        }
        .logo { font-size: 24px; margin-bottom: 10px; }
        .subtitle { color: #00e5ff; font-size: 14px; }
        .section { 
            margin: 30px 0; 
            padding: 20px; 
            background: rgba(255,255,255,0.05); 
            border-radius: 8px;
            border-left: 4px solid #00e5ff;
        }
        .section-title { 
            font-size: 18px; 
            font-weight: 600; 
            margin-bottom: 15px; 
            color: #00e5ff;
        }
        .morpheme-card {
            background: rgba(0,229,255,0.1);
            border: 1px solid #00e5ff;
            border-radius: 8px;
            padding: 15px;
            margin: 10px 0;
        }
        .event-item {
            background: rgba(255,255,255,0.03);
            padding: 8px 12px;
            margin: 5px 0;
            border-radius: 4px;
            font-size: 12px;
        }
        .agent-stake {
            display: inline-block;
            background: rgba(255,255,255,0.1);
            padding: 4px 8px;
            margin: 2px;
            border-radius: 4px;
            font-size: 11px;
        }
        .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid rgba(255,255,255,0.2);
            font-size: 12px;
            color: rgba(255,255,255,0.6);
        }
        .hashscan-link {
            color: #00e5ff;
            text-decoration: none;
            word-break: break-all;
        }
        .status-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 600;
        }
        .status-confirmed { background: #00ff8820; color: #00ff88; }
        .status-blocked { background: #ff4d6d20; color: #ff4d6d; }
        @media print {
            body { background: white; color: black; }
            .section { background: #f5f5f5; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">⬡ AegisMorpheme-X Protocol</div>
        <div class="subtitle">AI Governance Infrastructure Demo Report</div>
        <div style="font-size: 12px; margin-top: 10px;">
            Generated: ${new Date(data.timestamp).toLocaleString()} | 
            Network: ${data.systemInfo.network} | 
            Version: ${data.systemInfo.version}
        </div>
    </div>

    <div class="section">
        <div class="section-title">🌍 City Configuration</div>
        <div><strong>City:</strong> ${data.city.name}, ${data.city.country}</div>
        <div><strong>Population:</strong> ${data.city.population}</div>
        <div><strong>AQI Average:</strong> ${data.city.aqi_avg}</div>
        <div><strong>Climate:</strong> ${data.city.climate}</div>
        <div><strong>Poverty Index:</strong> ${(data.city.poverty_index * 100).toFixed(1)}%</div>
        <div><strong>Base Threshold:</strong> ${data.city.base_threshold}</div>
    </div>

    <div class="section">
        <div class="section-title">🧬 Executable Morpheme-X</div>
        ${data.morpheme ? `
            <div class="morpheme-card">
                <div><strong>Intent Hash:</strong> <code style="font-size: 10px;">${data.morpheme.intent_hash}</code></div>
                <div><strong>Model Snapshot:</strong> ${data.morpheme.model_snapshot_hash}</div>
                <div><strong>Risk Score:</strong> ${data.morpheme.risk_score}</div>
                <div><strong>Triage Decision:</strong> ${data.morpheme.triage}</div>
                <div><strong>Diagnosis:</strong> ${data.morpheme.diagnosis}</div>
                <div><strong>Outbreak Risk:</strong> ${data.morpheme.outbreak_risk}</div>
                <div><strong>Insurance Trigger:</strong> ${data.morpheme.insurance_trigger ? 'YES' : 'NO'}</div>
                <div><strong>Payout Amount:</strong> ${data.morpheme.payout_amount} HCVR</div>
                <div><strong>Status:</strong> 
                    <span class="status-badge ${data.morpheme.blocked ? 'status-blocked' : 'status-confirmed'}">
                        ${data.morpheme.blocked ? 'BLOCKED' : 'CONFIRMED'}
                    </span>
                </div>
                ${data.morpheme.hedera_tx_id ? `
                    <div style="margin-top: 10px;">
                        <strong>Hedera Transaction:</strong><br>
                        <a href="${data.morpheme.explorer_url}" class="hashscan-link" target="_blank">
                            ${data.morpheme.hedera_tx_id}
                        </a>
                    </div>
                ` : ''}
            </div>
        ` : '<div>No Morpheme-X data available</div>'}
    </div>

    <div class="section">
        <div class="section-title">🤖 Agent Activity Log</div>
        ${data.events.length > 0 ? `
            ${data.events.map(event => `
                <div class="event-item">
                    <strong>${new Date(event._ts || event.timestamp * 1000).toLocaleTimeString()}</strong> - 
                    ${event.type}: ${event.reasoning || `${event.agent || ''} ${event.decision || ''}`}
                </div>
            `).join('')}
        ` : '<div>No events recorded</div>'}
    </div>

    <div class="section">
        <div class="section-title">💰 Agent Stakes</div>
        ${data.agentStakes ? `
            ${Object.entries(data.agentStakes).map(([agent, stake]) => `
                <div class="agent-stake">
                    <strong>${agent}:</strong> ${stake} AMXSTAKE
                </div>
            `).join('')}
        ` : '<div>No stake data available</div>'}
    </div>

    <div class="section">
        <div class="section-title">⚡ Anomaly Detection</div>
        ${data.anomalyData ? `
            <div><strong>Last Anomaly:</strong> ${data.anomalyData.timestamp ? new Date(data.anomalyData.timestamp * 1000).toLocaleString() : 'N/A'}</div>
            <div><strong>Z-Score:</strong> ${data.anomalyData.zscore || 'N/A'}</div>
            <div><strong>Agent Affected:</strong> ${data.anomalyData.agent || 'N/A'}</div>
        ` : '<div>No anomaly data available</div>'}
    </div>

    <div class="footer">
        <div>AegisMorpheme-X Protocol • AI Governance Infrastructure</div>
        <div>Verified on Hedera Hashgraph • Self-Governing • Economically Accountable</div>
        <div style="margin-top: 10px;">
            <a href="https://hashscan.io/testnet" class="hashscan-link" target="_blank">Verify on HashScan →</a>
        </div>
    </div>
</body>
</html>`;
  };

  const downloadReport = async (htmlContent, data) => {
    // Create a blob from the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `AMX-Protocol-Demo-Report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      background: 'rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: 20,
      color: '#fff',
      textAlign: 'center'
    }}>
      <div style={{ 
        fontSize: 16, 
        fontWeight: 600, 
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
      }}>
        <span style={{ fontSize: 20 }}>📄</span>
        Export Demo Report
      </div>
      
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>
        Generate a comprehensive PDF report with all demo data
      </div>

      <button
        onClick={generateReport}
        disabled={generating}
        style={{
          background: generating 
            ? 'rgba(255,255,255,0.1)' 
            : 'linear-gradient(135deg, #00e5ff, #0099cc)',
          border: '1px solid #00e5ff',
          borderRadius: 8,
          padding: '12px 24px',
          color: '#fff',
          cursor: generating ? 'not-allowed' : 'pointer',
          fontSize: 14,
          fontWeight: 600,
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          margin: '0 auto'
        }}
        onMouseEnter={(e) => {
          if (!generating) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(0,229,255,0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!generating) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }
        }}
      >
        {generating ? (
          <>
            <div style={{
              width: 16,
              height: 16,
              border: '2px solid #fff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Generating Report...
          </>
        ) : generated ? (
          <>
            <span style={{ fontSize: 18 }}>✅</span>
            Report Generated!
          </>
        ) : (
          <>
            <span style={{ fontSize: 18 }}>📥</span>
            Export Report
          </>
        )}
      </button>

      {generated && (
        <div style={{ 
          marginTop: 12, 
          fontSize: 11, 
          color: '#00ff88',
          animation: 'fadeIn 0.5s ease-in'
        }}>
          ✓ Report downloaded successfully!
        </div>
      )}

      <div style={{ 
        marginTop: 16, 
        fontSize: 10, 
        color: 'rgba(255,255,255,0.5)',
        lineHeight: 1.4
      }}>
        Report includes:<br/>
        • Morpheme-X transaction details<br/>
        • HashScan verification link<br/>
        • Agent activity log<br/>
        • City configuration<br/>
        • Anomaly detection data
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ReportExporter;
