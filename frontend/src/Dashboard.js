/**
 * AMX Protocol – Main Dashboard Component
 * Real-time AI governance dashboard with WebSocket event feed.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import MorphemeCard from './MorphemeCard';
import AnomalyChart from './AnomalyChart';
import CitySwitcher from './CitySwitcher';
import ReportExporter from './ReportExporter';
import OneHealthMap from './OneHealthMap';
import { useAMXWebSocket } from './websocket';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const MAX_EVENTS = 80;

// ── Helper: risk colour ─────────────────────────────────────────────────────
function riskColor(r) {
  if (r >= 0.75) return 'var(--accent-red)';
  if (r >= 0.45) return 'var(--accent-orange)';
  return 'var(--accent-green)';
}

function riskLabel(r) {
  if (r >= 0.75) return 'HIGH RISK';
  if (r >= 0.45) return 'MODERATE';
  return 'LOW RISK';
}

// ── Helper: event meta ───────────────────────────────────────────────────────
function eventMeta(ev) {
  switch (ev.type) {
    case 'risk_received':
      return { icon: '🎙️', color: 'var(--accent-primary)',  label: 'Risk Received',      detail: `Score: ${ev.risk?.toFixed(3)}` };
    case 'agent_decision':
      return { icon: '🤖', color: 'var(--accent-purple)',   label: `Agent: ${ev.agent}`, detail: ev.reasoning || ev.decision?.slice(0, 60) };
    case 'agent_slash':
      return { icon: '💸', color: 'var(--accent-red)',      label: 'Agent Slashed',       detail: ev.reasoning || `${ev.agent} stake slashed` };
    case 'morpheme_created':
      return { icon: '🧬', color: 'var(--accent-green)',    label: 'Morpheme-X Created', detail: `TX: ${ev.morpheme?.hedera_tx_id?.slice(0, 30)}…` };
    case 'sentinel_block':
      return { icon: '🚫', color: 'var(--accent-red)',      label: '⚡ Sentinel BLOCK',  detail: ev.reasoning || `Agent ${ev.agent} anomaly detected — slashing 10%` };
    case 'sentinel_check':
      return { icon: '🛡️', color: 'var(--accent-primary)',  label: 'Sentinel Check',     detail: ev.reasoning || (ev.blocked ? 'BLOCKED' : 'All agents passed') };
    case 'payout_triggered':
      return { icon: '💰', color: 'var(--accent-yellow)',   label: 'Payout Triggered',   detail: `${ev.payout_amount?.toFixed(2)} HCVR (threshold ${ev.threshold?.toFixed(3)})` };
    case 'payout_declined':
      return { icon: '⏳', color: 'var(--text-muted)',       label: 'Payout Declined',    detail: `Risk below threshold ${ev.threshold?.toFixed(3)}` };
    case 'hcvr_payout':
      return { icon: '🏦', color: 'var(--accent-orange)',   label: 'HCVR Transferred',   detail: `${ev.amount} HCVR → ${ev.recipient}` };
    case 'outbreak_risk_update':
      return { icon: '🦠', color: 'var(--accent-purple)',   label: 'Outbreak Risk Update',detail: `Outbreak: ${ev.outbreak_risk?.toFixed(3)}${ev.genomic_hire ? ' · Genomic agent hired' : ''}` };
    case 'pipeline_complete':
      return { icon: '✅', color: 'var(--accent-green)',    label: 'Pipeline Complete',   detail: `Triage: ${ev.triage} | Blocked: ${ev.blocked}` };
    case 'connected':
      return { icon: '🔌', color: 'var(--accent-primary)',  label: 'WS Connected',        detail: 'AMX Protocol WebSocket active' };
    default:
      return { icon: '📡', color: 'var(--text-secondary)',  label: ev.type,               detail: '' };
  }
}

// ── Risk Gauge (SVG arc) ────────────────────────────────────────────────────
function RiskGauge({ risk }) {
  const r = 70;
  const cx = 90, cy = 90;
  const startAngle = 180;
  const endAngle   = 0;
  const angle = startAngle - risk * 180;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const arc = (deg) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy - r * Math.sin(toRad(deg)),
  });

  const start = arc(startAngle);
  const end   = arc(endAngle);
  const cur   = arc(angle);
  const color = riskColor(risk);

  return (
    <svg viewBox="0 0 180 100" style={{ width: 180, height: 100 }}>
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="var(--accent-green)" />
          <stop offset="50%"  stopColor="var(--accent-orange)" />
          <stop offset="100%" stopColor="var(--accent-red)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Track */}
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
        fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" strokeLinecap="round"
      />
      {/* Fill */}
      <path
        d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${cur.x} ${cur.y}`}
        fill="none" stroke="url(#gaugeGrad)" strokeWidth="8" strokeLinecap="round"
        filter="url(#glow)"
        style={{ transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
      {/* Needle dot */}
      <circle
        cx={cur.x} cy={cur.y} r="6"
        fill={color} stroke="var(--bg-base)" strokeWidth="2"
        filter="url(#glow)"
        style={{ transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
      {/* Labels */}
      <text x="14" y="95" fontSize="9" fill="var(--accent-green)" fontFamily="var(--font-mono)">0.0</text>
      <text x="154" y="95" fontSize="9" fill="var(--accent-red)" fontFamily="var(--font-mono)">1.0</text>
      <text x="82" y="84" fontSize="9" fill="var(--accent-orange)" fontFamily="var(--font-mono)">0.5</text>
    </svg>
  );
}

// ── Stake Bar ────────────────────────────────────────────────────────────────
function StakeBar({ agent, amount, max = 2500 }) {
  const pct = Math.max(0, Math.min(100, (amount / max) * 100));
  const hue = pct > 70 ? 165 : pct > 40 ? 35 : 0;
  const color = `hsl(${hue}, 100%, 65%)`;
  const icons = { triage: '🚑', diagnosis: '🔬', finance: '💳', epidemiology: '🌍' };

  return (
    <div className="stake-row">
      <div className="stake-meta">
        <span className="stake-agent">{icons[agent] || '🤖'} {agent}</span>
        <span className="stake-amount">{amount.toFixed(0)} AMXSTAKE</span>
      </div>
      <div className="stake-bar-track">
        <div className="stake-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = ({ events: externalEvents, setEvents: setExternalEvents }) => {
  const [risk, setRisk]                 = useState(null);
  const [triage, setTriage]             = useState(null);
  const [diagnosis, setDiagnosis]       = useState(null);
  const [sentinelAlert, setSentinelAlert] = useState(false);
  const [sentinelMsg, setSentinelMsg]   = useState('All agents nominal');
  const [payout, setPayout]             = useState(null);
  const [outbreakRisk, setOutbreakRisk] = useState(null);
  const [genomicHire, setGenomicHire]   = useState(null);
  const [stakes, setStakes]             = useState({ triage: 2500, diagnosis: 2500, finance: 2500, epidemiology: 2500 });
  const [slashLog, setSlashLog]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [scenario, setScenario]         = useState('normal');
  const [runCount, setRunCount]         = useState(0);
  const [currentCity, setCurrentCity]   = useState('Dhaka');
  const [cityConfig, setCityConfig]     = useState(null);
  const [events, setEvents]             = useState(externalEvents || []);
  const feedRef = useRef(null);

  // Throttled auto-scroll
  const scrollFeed = useCallback(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, []);

  // Fetch agent stakes from API
  const refreshStakes = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/agents/stakes`);
      const data = await res.json();
      setStakes(data.stakes);
    } catch (_) {}
  }, []);

  useEffect(() => { refreshStakes(); }, [refreshStakes]);

  // WebSocket event handler
  const handleEvent = useCallback((ev) => {
    const updated = [{ ...ev, _ts: Date.now() }, ...events].slice(0, MAX_EVENTS);
    setEvents(updated);
    
    // Also update parent events if available
    if (setExternalEvents) {
      setExternalEvents(updated);
    }
    
    setTimeout(scrollFeed, 50);

    switch (ev.type) {
      case 'connected':
        if (ev.stakes) setStakes(ev.stakes);
        break;
      case 'city_changed':
        setCurrentCity(ev.city);
        setCityConfig(ev.config);
        break;
      case 'risk_received':
        setRisk(ev.risk);
        setTriage(null);
        setDiagnosis(null);
        setPayout(null);
        setSentinelAlert(false);
        setSentinelMsg('All agents nominal');
        setGenomicHire(null);
        break;
      case 'agent_decision':
        if (ev.agent === 'triage')    setTriage(ev.decision);
        if (ev.agent === 'diagnosis') setDiagnosis(ev.decision);
        break;
      case 'morpheme_created':
        setMorpheme(ev.morpheme);
        setMorphemeNew(true);
        setTimeout(() => setMorphemeNew(false), 1000);
        break;
      case 'sentinel_block':
        setSentinelAlert(true);
        setSentinelMsg(`Anomaly in ${ev.agent} — slashing 10% stake`);
        setSlashLog((prev) => [ev, ...prev].slice(0, 20));
        refreshStakes();
        break;
      case 'payout_triggered':
      case 'hcvr_payout':
        setPayout(ev);
        break;
      case 'outbreak_risk_update':
        setOutbreakRisk(ev.outbreak_risk);
        if (ev.genomic_hire) setGenomicHire(ev.genomic_hire);
        break;
      default:
        break;
    }
  }, [scrollFeed, refreshStakes]);

  const { connected } = useAMXWebSocket(handleEvent);

  // Run simulation
  const runSimulation = useCallback(async (sc) => {
    setLoading(true);
    setScenario(sc);
    try {
      const endpoint = sc === 'anomaly'
        ? `${API_BASE}/api/analyze/anomaly`
        : `${API_BASE}/api/simulate/cough?scenario=${sc}`;
      await fetch(endpoint, { method: 'POST' });
      setRunCount((c) => c + 1);
    } catch (err) {
      console.error('[Dashboard] Simulation error:', err);
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  }, []);

  const agentRows = [
    {
      id: 'triage',
      name: 'Triage Agent',
      icon: '🚑',
      iconBg: 'rgba(255,77,109,0.12)',
      decision: triage,
      badge: triage && (
        <span className={`agent-badge badge-${triage?.toLowerCase().replace('_','-')}`}>{triage}</span>
      ),
    },
    {
      id: 'diagnosis',
      name: 'Diagnosis Agent',
      icon: '🔬',
      iconBg: 'rgba(167,139,250,0.12)',
      decision: diagnosis,
      badge: diagnosis && <span className="agent-badge badge-active">DIAGNOSED</span>,
    },
    {
      id: 'finance',
      name: 'Finance Agent',
      icon: '💳',
      iconBg: 'rgba(255,214,10,0.12)',
      decision: payout
        ? `${payout.payout_amount?.toFixed(2) || payout.amount?.toFixed(2)} HCVR payout`
        : (risk !== null ? 'Computing threshold…' : 'Awaiting input'),
      badge: payout && <span className="agent-badge badge-active">TRIGGERED</span>,
    },
    {
      id: 'epidemiology',
      name: 'Epidemiology Agent',
      icon: '🌍',
      iconBg: 'rgba(124,58,237,0.12)',
      decision: outbreakRisk !== null
        ? `Outbreak risk: ${outbreakRisk?.toFixed(3)}${genomicHire ? ' · Genomic hired' : ''}`
        : 'Awaiting One Health data',
      badge: genomicHire && <span className="agent-badge badge-active">HIRED</span>,
    },
    {
      id: 'sentinel',
      name: 'Meta-Sentinel',
      icon: '🛡️',
      iconBg: sentinelAlert ? 'rgba(255,77,109,0.12)' : 'rgba(0,229,255,0.08)',
      decision: sentinelMsg,
      badge: sentinelAlert
        ? <span className="agent-badge badge-anomaly">ANOMALY</span>
        : <span className="agent-badge badge-pass">PASS</span>,
      anomaly: sentinelAlert,
    },
  ];

  // Format timestamp
  const fmtTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div>
      {/* Stats Row */}
      <div className="stats-row">
        <div className="card stat-card" style={{ '--accent-line': 'var(--accent-primary)' }}>
          <div className="stat-label">Total Runs</div>
          <div className="stat-value text-cyan">{runCount}</div>
          <div className="stat-sub">Simulations executed</div>
        </div>
        <div className="card stat-card" style={{ '--accent-line': 'var(--accent-red)' }}>
          <div className="stat-label">Anomalies Detected</div>
          <div className="stat-value text-red">{slashLog.length}</div>
          <div className="stat-sub">Stake slashing events</div>
        </div>
        <div className="card stat-card" style={{ '--accent-line': 'var(--accent-green)' }}>
          <div className="stat-label">Morphemes On-Chain</div>
          <div className="stat-value text-green">{morpheme ? 1 : 0}</div>
          <div className="stat-sub">Hedera HCS verified</div>
        </div>
        <div className="card stat-card" style={{ '--accent-line': 'var(--accent-yellow)' }}>
          <div className="stat-label">Payouts Triggered</div>
          <div className="stat-value text-yellow">{payout ? '1' : '0'}</div>
          <div className="stat-sub">HCVR disbursed</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">

        {/* LEFT: Risk + Agents */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Risk Gauge Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon" style={{ background: 'rgba(0,229,255,0.1)' }}>🎙️</div>
                TinyML Risk Score
              </div>
              <span style={{
                fontSize: 11, padding: '3px 8px', borderRadius: 6,
                background: 'rgba(0,229,255,0.08)', color: 'var(--accent-primary)',
                fontFamily: 'var(--font-mono)'
              }}>ICBHI-2017</span>
            </div>
            <div className="risk-gauge-container">
              <RiskGauge risk={risk ?? 0} />
              <div className="risk-value-display">
                <div className="risk-number" style={{ color: riskColor(risk ?? 0) }}>
                  {risk !== null ? risk.toFixed(3) : '—'}
                </div>
                <div className="risk-label" style={{ color: riskColor(risk ?? 0) }}>
                  {risk !== null ? riskLabel(risk) : 'NO DATA'}
                </div>
              </div>
            </div>
          </div>

          {/* Agent Stakes */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon" style={{ background: 'rgba(124,58,237,0.12)' }}>🪙</div>
                AMXSTAKE Balances
              </div>
              <span className="trust-pill" style={{ fontSize: 10 }}>HTS TOKEN</span>
            </div>
            <div className="stake-list">
              {Object.entries(stakes).map(([agent, amount]) => (
                <StakeBar key={agent} agent={agent} amount={amount} />
              ))}
            </div>
          </div>
        </div>

        {/* CENTER: Agent Pipeline + Morpheme-X */}
        <div className="col-4" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Agent Pipeline */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon" style={{ background: 'rgba(167,139,250,0.12)' }}>⚙️</div>
                Agent Mesh
              </div>
              {loading && <div className="spinner text-cyan" />}
            </div>
            <div className="agent-pipeline">
              {agentRows.map((ag) => (
                <div
                  key={ag.id}
                  className={`agent-row ${ag.decision && !ag.anomaly ? 'active' : ''} ${ag.anomaly ? 'anomaly' : ''}`}
                >
                  <div className="agent-icon" style={{ background: ag.iconBg }}>{ag.icon}</div>
                  <div className="agent-info">
                    <div className="agent-name">{ag.name}</div>
                    <div className="agent-decision">{ag.decision || 'Awaiting…'}</div>
                  </div>
                  <div className="agent-status">
                    {ag.badge || <span className="agent-badge badge-pending">IDLE</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Morpheme-X Card */}
          <MorphemeCard morpheme={morpheme} />

          {/* City Switcher */}
          <div style={{ marginTop: 20 }}>
            <CitySwitcher onCityChange={(city, config) => {
              console.log('City changed to:', city, config);
            }} />
          </div>

          {/* Anomaly Visualization */}
          <div style={{ marginTop: 20 }}>
            <AnomalyChart 
              sentinelHistory={[]} 
              currentAnomaly={events.find(e => e.type === 'sentinel_block')}
            />
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon" style={{ background: 'rgba(0,229,255,0.08)' }}>🛡️</div>
                Meta-Sentinel
              </div>
              <span style={{
                fontSize: 11, fontFamily: 'var(--font-mono)',
                color: sentinelAlert ? 'var(--accent-red)' : 'var(--accent-green)',
                background: sentinelAlert ? 'rgba(255,77,109,0.1)' : 'rgba(0,255,163,0.08)',
                padding: '3px 8px', borderRadius: 6
              }}>
                {sentinelAlert ? '⚠ ALERT' : '✓ NOMINAL'}
              </span>
            </div>
            <div className={`sentinel-status ${sentinelAlert ? 'alert' : 'safe'}`}>
              <span className="sentinel-icon">{sentinelAlert ? '🚨' : '✅'}</span>
              <div className="sentinel-text">
                <h3 style={{ color: sentinelAlert ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                  {sentinelAlert ? 'Anomaly Detected' : 'All Agents Nominal'}
                </h3>
                <p>{sentinelMsg}</p>
              </div>
            </div>
            {sentinelAlert && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
                🔁 Retraining round scheduled · Hard negatives dataset updated · 10% stake slashed
              </div>
            )}
          </div>

          {/* One Health */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon" style={{ background: 'rgba(124,58,237,0.12)' }}>🌍</div>
                One Health Data
              </div>
            </div>
            <div className="one-health-grid">
              <div className="health-metric">
                <div className="health-metric-icon">☁️</div>
                <div className="health-metric-label">Weather Risk</div>
                <div className="health-metric-value text-cyan">
                  {outbreakRisk !== null ? (Math.max(0, outbreakRisk - 0.1)).toFixed(2) : '—'}
                </div>
              </div>
              <div className="health-metric">
                <div className="health-metric-icon">🐄</div>
                <div className="health-metric-label">Livestock Risk</div>
                <div className="health-metric-value text-purple">
                  {outbreakRisk !== null ? (Math.min(1, outbreakRisk - 0.05)).toFixed(2) : '—'}
                </div>
              </div>
              <div className="health-metric">
                <div className="health-metric-icon">🦠</div>
                <div className="health-metric-label">Outbreak Risk</div>
                <div className="health-metric-value" style={{ color: outbreakRisk > 0.5 ? 'var(--accent-red)' : 'var(--accent-orange)' }}>
                  {outbreakRisk !== null ? outbreakRisk.toFixed(2) : '—'}
                </div>
              </div>
            </div>
            {genomicHire && (
              <div className="hol-agent hired" style={{ marginTop: 12 }}>
                <span style={{ fontSize: 20 }}>🧬</span>
                <div style={{ flex: 1 }}>
                  <div className="hol-name">{genomicHire.agent_id}</div>
                  <div className="hol-spec" style={{ color: 'var(--accent-orange)', fontSize: 11 }}>
                    {genomicHire.genomic_result}
                  </div>
                </div>
                <div className="hol-fee">{genomicHire.fee_hbar} ℏ</div>
              </div>
            )}
          </div>

          {/* One Health Map */}
          <div style={{ marginTop: 20 }}>
            <OneHealthMap 
              currentCity={currentCity}
              cityConfig={cityConfig}
              outbreakRisk={outbreakRisk}
            />
          </div>

          {/* Report Exporter */}
          <div style={{ marginTop: 20 }}>
            <ReportExporter
              morpheme={morpheme}
              events={events}
              cityConfig={cityConfig || {}}
              agentStakes={stakes}
              anomalyData={events.find(e => e.type === 'sentinel_block')}
            />
          </div>

          {/* HCVR Payout */}
          {payout && (
            <div className="payout-alert">
              <div style={{ fontSize: 32 }}>💰</div>
              <div>
                <div className="payout-label">Parametric Insurance Payout</div>
                <div className="payout-amount">
                  {(payout.payout_amount || payout.amount || 0).toFixed(2)}
                </div>
                <div className="payout-token">HCVR · No Paperwork · No Delay</div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM: Agent Reasoning Log + Event Feed */}
        <div className="col-12">
          {/* Agent Reasoning Log */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon" style={{ background: 'rgba(167,139,250,0.12)' }}>🧠</div>
                Agent Reasoning Log
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Step-by-step decision transparency
              </span>
            </div>
            <div className="reasoning-log" style={{ maxHeight: 200, overflowY: 'auto' }}>
              {events.filter(e => e.type === 'agent_decision' || e.type === 'sentinel_check' || e.type === 'sentinel_block' || e.type === 'agent_slash').length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>🤖</div>
                  <div>Agent reasoning will appear here during simulation</div>
                </div>
              ) : (
                events
                  .filter(e => e.type === 'agent_decision' || e.type === 'sentinel_check' || e.type === 'sentinel_block' || e.type === 'agent_slash')
                  .map((ev, i) => {
                    const m = eventMeta(ev);
                    return (
                      <div key={i} className={`event-item event-${ev.type}`} style={{ padding: '8px 12px', fontSize: 13 }}>
                        <span className="event-icon">{m.icon}</span>
                        <div className="event-content">
                          <div className="event-type" style={{ color: m.color, fontWeight: 500 }}>{m.label}</div>
                          <div className="event-detail" style={{ fontSize: 12 }}>{m.detail}</div>
                        </div>
                        <span className="event-time" style={{ fontSize: 11 }}>{fmtTime(ev._ts || Date.now())}</span>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Event Feed */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon" style={{ background: 'rgba(0,229,255,0.08)' }}>📡</div>
                Real-Time Event Stream
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {events.length} events
              </span>
            </div>
            <div className="event-feed" ref={feedRef}>
              {events.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📡</div>
                  <div>No events yet. Run a simulation to start the stream.</div>
                </div>
              ) : (
                events.map((ev, i) => {
                  const m = eventMeta(ev);
                  return (
                    <div key={i} className={`event-item event-${ev.type}`}>
                      <span className="event-icon">{m.icon}</span>
                      <div className="event-content">
                        <div className="event-type" style={{ color: m.color }}>{m.label}</div>
                        <div className="event-detail">{m.detail}</div>
                      </div>
                      <span className="event-time">{fmtTime(ev._ts || Date.now())}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
