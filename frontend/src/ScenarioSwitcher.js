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
      apiCall: () =>
        fetch(`${API_BASE}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ risk: 0.92, scenario: 'anomaly' }),
        }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }), // BUGFIX: handle fetch error
    },
    {
      id: 'nairobi_vector',
      name: '[>] NAIROBI_VEC',
      desc: 'Simulate vector mutation data requiring genomic API validation.',
      tag: 'IMP_MED',
      btnClass: 'btn-nairobi',
      tagColor: 'rgba(255,98,0,0.6)',
      // High risk normal — triggers epidemiology + genomic hire
      apiCall: () =>
        fetch(`${API_BASE}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ risk: 0.78, scenario: 'normal' }),
        }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }), // BUGFIX: handle fetch error
    },
    {
      id: 'singapore_norm',
      name: '[~] SGP_NOMINAL',
      desc: 'Simulate standard baseline conditions. Agents coordinate smoothly.',
      tag: 'IMP_LOW',
      btnClass: 'btn-sgp',
      tagColor: 'rgba(200,255,0,0.6)',
      // Low-medium risk normal
      apiCall: () =>
        fetch(`${API_BASE}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ risk: 0.35, scenario: 'normal' }),
        }).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }), // BUGFIX: handle fetch error
    },
  ];

  const handleSelect = async (scenario) => {
    if (disabled) return;
    setActive(scenario.id);
    try {
      await scenario.apiCall();
      if (onScenarioExecute) onScenarioExecute(scenario.id);
    } catch (err) {
      console.error('[ScenarioSwitcher] Failed to trigger scenario:', err); // BUGFIX: log errors properly
      alert(`Simulation Error: ${err.message}`); // BUGFIX: give user feedback on failure
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
