import React, { useState, useCallback, useRef, useEffect } from 'react';
import MorphemeCard from './MorphemeCard';
import AnomalyChart from './AnomalyChart';
import CitySwitcher from './CitySwitcher';
import ReportExporter from './ReportExporter';
import OneHealthMap from './OneHealthMap';
import ImpactDashboard from './ImpactDashboard';
import { useAMXWebSocket } from './websocket';
import Toast from './Toast';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const MAX_EVENTS = 80;

function eventMeta(ev) {
  // BUGFIX: Guard against undefined/null event
  if (!ev) return { ascii: '[?]', label: 'UNKNOWN', detail: 'Invalid event data', isAnomaly: false, isAcid: false };

  let isAnomaly = false;
  let isAcid = false;
  
  if (['sentinel_block', 'agent_slash'].includes(ev.type)) isAnomaly = true;
  if (['payout_triggered', 'hcvr_payout', 'risk_received'].includes(ev.type)) isAcid = true;
  if (ev.decision?.includes('positive')) isAcid = true;

  switch (ev.type) {
    case 'risk_received':
      return { ascii: '[+]', label: 'RISK_RCV', detail: `SCORE: ${ev.risk?.toFixed(3) || '0.000'}`, isAnomaly, isAcid }; // BUGFIX: null check risk
    case 'agent_decision':
      return { ascii: '[>]', label: `AGT_${ev.agent || 'UNK'}`, detail: ev.reasoning || ev.decision?.slice(0, 60) || '', isAnomaly, isAcid }; // BUGFIX: null check agent
    case 'agent_slash':
      return { ascii: '[!]', label: 'STAKE_SLASH', detail: ev.reasoning || `${ev.agent} stake slashed`, isAnomaly, isAcid };
    case 'morpheme_created':
      return { ascii: '[M]', label: 'MORPH_GEN', detail: `TX: ${ev.morpheme?.hedera_tx_id?.slice(0, 30) || 'PENDING'}...`, isAnomaly, isAcid }; // BUGFIX: null check morpheme
    case 'sentinel_block':
      return { ascii: '[X]', label: 'SENTINEL_BLK', detail: ev.reasoning || `Agent ${ev.agent} anomaly detected`, isAnomaly, isAcid };
    case 'sentinel_check':
      return { ascii: '[*]', label: 'SENTINEL_CHK', detail: ev.reasoning || (ev.blocked ? 'BLOCKED' : 'PASS'), isAnomaly, isAcid };
    case 'payout_triggered':
      return { ascii: '[$]', label: 'PAYOUT_TRG', detail: `${ev.payout_amount?.toFixed(2) || '0.00'} HCVR`, isAnomaly, isAcid }; // BUGFIX: null check amount
    case 'payout_declined':
      return { ascii: '[-]', label: 'PAYOUT_DCL', detail: `Risk < THRESHOLD`, isAnomaly, isAcid };
    case 'hcvr_payout':
      return { ascii: '[#]', label: 'HCVR_TX', detail: `${ev.amount || '0'} HCVR TX`, isAnomaly, isAcid }; // BUGFIX: null check amount
    case 'outbreak_risk_update':
      return { ascii: '[O]', label: 'OUTBREAK_UPD', detail: `Risk: ${ev.outbreak_risk?.toFixed(3) || '0.000'}`, isAnomaly, isAcid }; // BUGFIX: null check risk
    case 'pipeline_complete':
      return { ascii: '[V]', label: 'EXEC_DONE', detail: `Pipeline ended`, isAnomaly, isAcid };
    case 'connected':
      return { ascii: '[C]', label: 'WS_SYNC', detail: 'AMX Protocol WebSocket active', isAnomaly, isAcid };
    default:
      return { ascii: '[~]', label: ev.type || 'EVENT', detail: '', isAnomaly, isAcid };
  }
}

const Dashboard = ({ events: externalEvents, setEvents: setExternalEvents }) => {
  const [risk, setRisk]                   = useState(null);
  const [triage, setTriage]               = useState(null);
  const [diagnosis, setDiagnosis]         = useState(null);
  const [sentinelAlert, setSentinelAlert] = useState(false);
  const [sentinelMsg, setSentinelMsg]     = useState('SYSTEM NOMINAL');
  const [payout, setPayout]               = useState(null);
  const [outbreakRisk, setOutbreakRisk]   = useState(null);
  const [genomicHire, setGenomicHire]     = useState(null);
  const [stakes, setStakes]               = useState({ triage: 2500, diagnosis: 2500, finance: 2500, epidemiology: 2500 });
  const [slashLog, setSlashLog]           = useState([]);
  const [currentCity, setCurrentCity]     = useState('Dhaka');
  const [cityConfig, setCityConfig]       = useState(null);
  const [morpheme, setMorpheme]           = useState(null);
  const [morphemeNew, setMorphemeNew]     = useState(false);
  const [runCount, setRunCount]           = useState(0);
  const [events, setEvents]               = useState(externalEvents || []);
  const [showVerifyToast, setShowVerifyToast] = useState(false);
  
  const feedRef = useRef(null);
  const isMounted = useRef(true); // BUGFIX: mount tracking

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const scrollFeed = useCallback(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, []);

  const refreshStakes = useCallback(async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/agents/stakes`);
      if (!res.ok) return; // BUGFIX: check response ok
      const data = await res.json();
      if (isMounted.current && data && data.stakes) { // BUGFIX: mount check & null check
        setStakes(data.stakes);
      }
    } catch (_) {
      console.warn('[Dashboard] Failed to refresh stakes'); // BUGFIX: logging
    }
  }, []);

  useEffect(() => { refreshStakes(); }, [refreshStakes]);

  const handleEvent = useCallback((ev) => {
    if (!ev || !isMounted.current) return; // BUGFIX: null & mount check

    // Use functional setState to avoid stale closure on events
    setEvents(prev => {
      const updated = [{ ...ev, _ts: Date.now() }, ...prev].slice(0, MAX_EVENTS);
      if (setExternalEvents) setExternalEvents(updated);
      return updated;
    });
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
        setTriage(null); setDiagnosis(null); setPayout(null);
        setSentinelAlert(false); setSentinelMsg('SYSTEM NOMINAL'); setGenomicHire(null);
        break;
      case 'pipeline_complete':
        setRunCount(prev => prev + 1);
        break;
      case 'agent_decision':
        if (ev.agent === 'triage')    setTriage(ev.decision);
        if (ev.agent === 'diagnosis') setDiagnosis(ev.decision);
        break;
      case 'morpheme_created':
        setMorpheme(ev.morpheme);
        setMorphemeNew(true);
        setTimeout(() => { if (isMounted.current) setMorphemeNew(false); }, 1000); // BUGFIX: mount check in timeout
        break;
      case 'sentinel_block':
        setSentinelAlert(true);
        setSentinelMsg(`ANOMALY: ${ev.agent || 'Agent'} | -10% STAKE`);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollFeed, refreshStakes, setExternalEvents]);

  useAMXWebSocket(handleEvent);

  const fmtTime = (ts) => {
    if (!ts) return '00:00:00.000'; // BUGFIX: time guard
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
  };

  const activeAgentNow = events[0] ? events[0].agent : null;

  return (
    <>
      <div id="dashboard-start" style={{ scrollMarginTop: '60px' }}></div>

      <ImpactDashboard events={events} stakes={stakes} />
      
      <div className="dashboard-grid">

        <div className="col-3 gap-stack">
          {/* Risk Card */}
          <div className="dashboard-card card" style={{ height: '100%' }}>
            <div className="card-header">
              <div className="card-title">[-_-] TinyML Engine</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 120 }}>
              {risk !== null ? (
                <>
                  <div className="risk-number" style={{ color: risk > 0.75 ? 'var(--orange)' : 'var(--text-primary)', marginTop: 0 }}>
                    {risk.toFixed(3)}
                  </div>
                  <div className="risk-label" style={{ color: risk > 0.75 ? 'var(--orange)' : 'var(--text-secondary)' }}>
                    {risk > 0.75 ? 'CRITICAL' : 'NOMINAL'}
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', gap: 6, margin: 'auto' }}>
                  <div className="meter-bar m-1" />
                  <div className="meter-bar m-2" />
                  <div className="meter-bar m-3" />
                </div>
              )}
            </div>
          </div>

          {/* AMX Stakes */}
          <div className="dashboard-card card">
            <div className="card-header">
              <div className="card-title">[HTS] Balances</div>
            </div>
            <div className="gap-stack" style={{ gap: 0 }}>
              {Object.entries(stakes).map(([agent, amount]) => {
                const isActive = activeAgentNow === agent;
                const isSlashedRecent = slashLog.length > 0 && slashLog[0].agent === agent;
                const rowClass = isActive ? (isSlashedRecent ? 'agent-row-active-orange' : 'agent-row-active-cyan') : '';
                return (
                  <div key={agent} className={`dense-row ${rowClass}`}>
                    <span className="dense-label">{agent}</span>
                    <span className="dense-val" style={{ color: isActive ? (isSlashedRecent ? 'var(--orange)' : 'var(--cyan)') : 'var(--text-primary)' }}>
                      {amount?.toFixed(0) || '0'} AMX
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dashboard-card card">
            <CitySwitcher onCityChange={(city, config) => {
              setCurrentCity(city);
              setCityConfig(config);
            }} />
          </div>
        </div>

        <div className="col-6 gap-stack">
          {/* Event Stream Terminal */}
          <div className="dashboard-card card">
            <div className="card-header">
              <div className="card-title">[SYS] Event Stream</div>
              <span className="agent-badge badge-active">{events.length} LOGS</span>
            </div>
            <div className="event-feed" ref={feedRef}>
              {events.length === 0 ? (
                <div style={{ padding: '24px 4px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                   {'>'} AWAITING DATA...
                </div>
              ) : (
                events.map((ev, i) => {
                  const m = eventMeta(ev);
                  const isNew = i === 0 && events.length > 1; // Basic trigger for scanline
                  
                  let labelCol = 'var(--text-secondary)';
                  let iconCol = 'var(--cyan)';
                  let detailCol = 'var(--text-muted)';
                  
                  if (m.isAnomaly) {
                    labelCol = 'var(--orange)'; iconCol = 'var(--orange)'; detailCol = 'var(--orange)';
                  } else if (m.isAcid) {
                    labelCol = 'var(--acid)'; iconCol = 'var(--acid)'; detailCol = 'var(--text-primary)';
                  }

                  return (
                    <div key={ev._ts || i} className={`event-item ${m.isAnomaly ? 'anomaly' : ''}`}>
                      {isNew && <div className="scan-line" />}
                      <span className="event-time">{fmtTime(ev._ts || Date.now())}</span>
                      <span className="event-arrow" style={{ color: iconCol }}>{'>'}</span>
                      <span className="event-type" style={{ color: labelCol }}>{m.label}</span>
                      <span className="event-dot">·</span>
                      <span className="event-detail" title={m.detail} style={{ color: detailCol }}>{m.detail}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="dashboard-card card">
            <MorphemeCard 
              morpheme={morpheme} 
              isNew={morphemeNew} 
              onVerify={() => setShowVerifyToast(true)}
            />
          </div>

          <div className={`dashboard-card card ${sentinelAlert ? 'anomaly-card' : ''}`}>
             <div className="card-header">
              <div className="card-title">[!] Meta-Sentinel</div>
              <span className={`agent-badge ${sentinelAlert ? 'badge-anomaly' : 'badge-active'}`}>
                {sentinelAlert ? 'ALERT' : 'NOMINAL'}
              </span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: sentinelAlert ? 'var(--orange)' : 'var(--cyan)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                {'>'} {sentinelMsg}
              </div>
            </div>
            <AnomalyChart
              sentinelHistory={[]}
              currentAnomaly={events.find(e => e && e.type === 'sentinel_block')}
            />
          </div>
        </div>

        <div className="col-3 gap-stack">
          <div className="dashboard-card card" style={{ padding: 0, background: 'transparent' }}>
            <OneHealthMap
              currentCity={currentCity}
              cityConfig={cityConfig}
              outbreakRisk={outbreakRisk}
              setSelectedCityExternal={setCurrentCity}
            />
          </div>

          <div className="dashboard-card card">
            <ReportExporter
              morpheme={morpheme}
              events={events}
              cityConfig={cityConfig || {}}
              agentStakes={stakes}
              anomalyData={events.find(e => e && e.type === 'sentinel_block')}
            />
          </div>
        </div>
      </div>

      <Toast 
        message="Verified on Hedera Consensus Service" 
        isVisible={showVerifyToast} 
        onClose={() => setShowVerifyToast(false)} 
      />
    </>
  );
};

export default Dashboard;
