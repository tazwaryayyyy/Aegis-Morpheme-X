import React, { useState } from 'react';

const ScenarioSwitcher = ({ onScenarioExecute, disabled }) => {
  const [active, setActive] = useState(null);

  const scenarios = [
    {
      id: 'dhaka_crisis',
      name: '[+] DHAKA_CRISIS',
      desc: 'Simulate severe outbreak risk. Forces agent overrides and parametric slashing.',
      tag: 'IMP_CRIT',
      btnClass: 'btn-dhaka',
      tagColor: 'rgba(255,42,42,0.6)' // Red
    },
    {
      id: 'nairobi_vector',
      name: '[>] NAIROBI_VEC',
      desc: 'Simulate vector mutation data requiring genomic API validation.',
      tag: 'IMP_MED',
      btnClass: 'btn-nairobi',
      tagColor: 'rgba(255,98,0,0.6)' // Orange
    },
    {
      id: 'singapore_norm',
      name: '[~] SGP_NOMINAL',
      desc: 'Simulate standard baseline conditions. Agents coordinate smoothly.',
      tag: 'IMP_LOW',
      btnClass: 'btn-sgp',
      tagColor: 'rgba(200,255,0,0.6)' // Green / Acid
    }
  ];

  const handleSelect = async (scenario) => {
    if (disabled) return;
    setActive(scenario.id);
    
    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      await fetch(`${API_BASE}/api/scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenario.id })
      });
      if (onScenarioExecute) onScenarioExecute(scenario.id);
    } catch (err) {
      console.error('Failed to trigger scenario', err);
    }
  };

  return (
    <div className="scenario-panel">
      {scenarios.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
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
