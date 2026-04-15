import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ScenarioSwitcher = ({ onScenarioExecute, disabled }) => {
  const [active, setActive] = useState(null);

  const scenarios = [
    {
      id: 'dhaka_crisis',
      name: '[+] DHAKA_CRISIS',
      desc: 'Simulate severe outbreak risk. Forces agent overrides and parametric slashing.',
      tag: 'IMP_CRIT',
      btnClass: 'btn-dhaka',
      tagColor: 'rgba(255,42,42,0.6)',
      // Map to real API call: high risk + anomaly to trigger sentinel
      apiCall: () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        return fetch(`${API_BASE}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ risk: 0.92, scenario: 'anomaly' }),
          signal: controller.signal,
        })
          .then(r => {
            clearTimeout(timeoutId);
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
          .catch(err => {
            clearTimeout(timeoutId);
            throw err;
          });
      },
    },
    {
      id: 'nairobi_vector',
      name: '[>] NAIROBI_VEC',
      desc: 'Simulate vector mutation data requiring genomic API validation.',
      tag: 'IMP_MED',
      btnClass: 'btn-nairobi',
      tagColor: 'rgba(255,98,0,0.6)',
      // High risk normal — triggers epidemiology + genomic hire
      apiCall: () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        return fetch(`${API_BASE}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ risk: 0.78, scenario: 'normal' }),
          signal: controller.signal,
        })
          .then(r => {
            clearTimeout(timeoutId);
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
          .catch(err => {
            clearTimeout(timeoutId);
            throw err;
          });
      },
    },
    {
      id: 'singapore_norm',
      name: '[~] SGP_NOMINAL',
      desc: 'Simulate standard baseline conditions. Agents coordinate smoothly.',
      tag: 'IMP_LOW',
      btnClass: 'btn-sgp',
      tagColor: 'rgba(200,255,0,0.6)',
      // Low-medium risk normal
      apiCall: () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        return fetch(`${API_BASE}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ risk: 0.35, scenario: 'normal' }),
          signal: controller.signal,
        })
          .then(r => {
            clearTimeout(timeoutId);
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
          })
          .catch(err => {
            clearTimeout(timeoutId);
            throw err;
          });
      },
    },
  ];

  const handleSelect = async (scenario) => {
    if (disabled) return;
    setActive(scenario.id);
    try {
      const response = await scenario.apiCall();
      // Pass the actual response to the parent component
      if (onScenarioExecute) onScenarioExecute(scenario.id, response);
    } catch (err) {
      console.error('[ScenarioSwitcher] Failed to trigger scenario:', err);
      // More detailed error message for debugging
      const errorMsg = err?.message || 'Unknown error occurred';
      alert(`Simulation Error: ${errorMsg}`);
    } finally {
      // Keep button highlighted briefly, then reset
      setTimeout(() => setActive(null), 3000);
    }
  };

  return (
    <div className="scenario-panel">
      {scenarios.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            id={`scenario-btn-${s.id}`}
            className={`scenario-btn magnetic-btn ${s.btnClass} ${isActive ? 'active' : ''}`}
            onClick={() => handleSelect(s)}
            disabled={disabled}
          >
            <div className="scenario-name" style={{ color: isActive ? 'inherit' : 'var(--text-primary)' }}>
              {s.name}
            </div>
            <div className="scenario-desc">{s.desc}</div>
            <div className="scenario-tag" style={{ color: s.tagColor }}>
              {s.tag} {isActive && '| EXEC...'}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ScenarioSwitcher;
