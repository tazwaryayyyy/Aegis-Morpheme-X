/**
 * AMX Protocol – Root App Component
 * Handles header, scenario control panel, and routing to Dashboard.
 */

import React, { useState, useCallback } from 'react';
import './index.css';
import Dashboard from './Dashboard';
import ScenarioSwitcher from './ScenarioSwitcher';
import RetrainingNotification from './RetrainingNotification';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function App() {
  const [loading, setLoading]     = useState(false);
  const [wsOnline, setWsOnline]   = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);
  const [events, setEvents]       = useState([]);

  // Listen to connection state via a custom event from the WS hook
  // (Dashboard passes it up through a shared context in large apps;
  //  here we poll the status endpoint for simplicity)
  React.useEffect(() => {
    const check = async () => {
      try {
        const r = await fetch(`${API_BASE}/api/status`);
        setWsOnline(r.ok);
      } catch { setWsOnline(false); }
    };
    check();
    const id = setInterval(check, 8000);
    return () => clearInterval(id);
  }, []);

  const handleScenarioExecute = useCallback((scenario, result) => {
    console.log('Scenario executed:', scenario, result);
    // Additional handling if needed
  }, []);

  const runScenario = useCallback(async (scenario) => {
    setLoading(true);
    setActiveBtn(scenario);
    try {
      const url = scenario === 'anomaly'
        ? `${API_BASE}/api/analyze/anomaly`
        : `${API_BASE}/api/simulate/cough?scenario=${scenario}`;
      const response = await fetch(url, { method: 'POST' });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      await response.json(); // Ensure response is processed
    } catch (err) {
      console.error('[App] Scenario error:', err);
      // Show error state to user
      alert(`Scenario execution failed: ${err.message}`);
    } finally {
      setLoading(false);
      setActiveBtn(null);
    }
  }, []);

  return (
    <div className="app-container">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">⬡</div>
            <div className="logo-text">
              <h1>AegisMorpheme-X</h1>
              <span>AMX Protocol v1.0 · AI Governance Infrastructure</span>
            </div>
          </div>
          <div className="header-status">
            <span className="network-badge">ℏ HEDERA TESTNET</span>
            <div className={`status-badge ${wsOnline ? 'online' : 'offline'}`}>
              <div className="status-dot" />
              {wsOnline ? 'BACKEND ONLINE' : 'CONNECTING…'}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="main-content">
        {/* Hero */}
        <section className="hero-section">
          <div className="hero-tagline">
            🔒 Every AI Decision is Verifiable · Enforceable · Accountable
          </div>
          <h1 className="hero-title">
            <span className="gradient-text">Self-Governing AI</span><br />
            Health &amp; Finance Network
          </h1>
          <p className="hero-subtitle">
            Executable Morpheme-X seals every agent decision on Hedera HCS.
            The Meta-Sentinel blocks rogue autonomy in real time.
            Adaptive parametric insurance pays out automatically — no paperwork.
          </p>

          {/* Scenario Control Panel */}
          <ScenarioSwitcher 
            onScenarioExecute={handleScenarioExecute}
            disabled={loading}
          />
        </section>

        {/* Dashboard */}
        <Dashboard events={events} setEvents={setEvents} />

        {/* Retraining Notifications */}
        <RetrainingNotification events={events} />
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="app-footer">
        <span>AMX Protocol</span> · MIT License · Powered by{' '}
        <span>Hedera HCS/HTS</span> · LangGraph · TinyML ·{' '}
        <a href="https://hashscan.io/testnet" target="_blank" rel="noopener noreferrer"
           style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
          HashScan Explorer ↗
        </a>
      </footer>
    </div>
  );
}
