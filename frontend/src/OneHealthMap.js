import React, { useState, useEffect, useRef } from 'react';

const OneHealthMap = ({ currentCity, outbreakRisk, setSelectedCityExternal }) => {
  const [selectedCity, setSelectedCity] = useState(currentCity || 'Dhaka');
  const [hoveredCity, setHoveredCity] = useState(null);
  const [scanSpeed] = useState(5000); // 5s loop
  const [timeStr, setTimeStr] = useState('');
  const [scanY, setScanY] = useState(0);
  const startTimeRef = useRef(Date.now());
  const frameRef = useRef(null);

  useEffect(() => {
    if (currentCity) setSelectedCity(currentCity);
  }, [currentCity]);

  useEffect(() => {
    const tick = () => setTimeStr(new Date().toUTCString().replace('GMT', 'UTC'));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) % scanSpeed;
      setScanY((elapsed / scanSpeed) * 666);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [scanSpeed]);

  const handleCitySelect = (c) => {
    setSelectedCity(c);
    if (setSelectedCityExternal) setSelectedCityExternal(c);
  };

  // Zoomed View Settings: 0° to 120°E | 40°N to 40°S
  // ViewBox: 0 0 1000 666
  const cities = {
    Dhaka: {
      x: 753, y: 135,
      color: '#FF3B3B',
      name: 'DHAKA',
      population: '21.0M',
      aqi: 162,
      climate: 'Monsoon',
      riskLevel: 'CRITICAL',
      baseOutbreak: 0.85,
      coords: '23.81°N, 90.41°E',
      zone: 'SOUTH-ASIA',
      vectorIdx: 94,
    },
    Nairobi: {
      x: 307, y: 344,
      color: '#FF9F1C',
      name: 'NAIROBI',
      population: '4.4M',
      aqi: 45,
      climate: 'Highland',
      riskLevel: 'VECTOR',
      baseOutbreak: 0.45,
      coords: '1.29°S, 36.82°E',
      zone: 'EAST-AFRICA',
      vectorIdx: 62,
    },
    Singapore: {
      x: 865, y: 322,
      color: '#00E5A0',
      name: 'SINGAPORE',
      population: '5.9M',
      aqi: 25,
      climate: 'Tropical',
      riskLevel: 'NOMINAL',
      baseOutbreak: 0.12,
      coords: '1.35°N, 103.82°E',
      zone: 'SE-ASIA',
      vectorIdx: 18,
    },
  };

  const activeData = cities[selectedCity] || cities.Dhaka;
  const displayOutbreak = (selectedCity === currentCity && outbreakRisk !== null)
    ? outbreakRisk : activeData.baseOutbreak;
  const outbreakPct = (displayOutbreak * 100).toFixed(1);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'linear-gradient(180deg, #090a0e 0%, #050608 100%)',
      border: '1px solid rgba(255,255,255,0.05)',
      overflow: 'hidden', position: 'relative',
    }}>
      <style>{`
        @keyframes amx-ping { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(3); opacity: 0; } }
        @keyframes amx-dash { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
        .ping { animation: amx-ping 2s cubic-bezier(0,0,0.2,1) infinite; transform-origin: center; transform-box: fill-box; }
        .arc { animation: amx-dash 3s linear infinite; }
      `}</style>

      {/* HEADER */}
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: activeData.color, boxShadow: `0 0 8px ${activeData.color}` }}/>
            GEO_INTEL // SECTOR_ALPHA
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {Object.keys(cities).map(cName => {
              const isActive = cName === selectedCity;
              return (
                <button
                  key={cName}
                  onClick={() => handleCitySelect(cName)}
                  style={{
                    background: isActive ? `${cities[cName].color}15` : 'transparent',
                    border: isActive ? `1px solid ${cities[cName].color}44` : '1px solid transparent',
                    color: isActive ? cities[cName].color : 'rgba(255,255,255,0.4)',
                    padding: '8px 18px', borderRadius: 4, cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                    letterSpacing: '0.1em', transition: 'all 0.2s ease',
                  }}
                >
                  {cName.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(255,255,255,0.25)', textAlign: 'right', lineHeight: 1.5 }}>
          <div>AMX_GEO_v3.0</div>
          <div style={{ color: 'rgba(255,255,255,0.5)' }}>{timeStr}</div>
        </div>
      </div>

      {/* MAP VIEW */}
      <div style={{ position: 'relative', width: '100%', height: 260, background: '#040507', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <svg viewBox="0 0 1000 666" style={{ width: '100%', height: '100%', display: 'block' }}>
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <linearGradient id="scanGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="transparent"/><stop offset="50%" stopColor="rgba(0,255,255,0.15)"/><stop offset="100%" stopColor="transparent"/>
            </linearGradient>
          </defs>

          {/* GRID */}
          <g stroke="rgba(255,255,255,0.02)" strokeWidth="0.5">
            {Array.from({length: 12}).map((_,i) => <line key={i} x1={i*100} y1="0" x2={i*100} y2="666"/>)}
            {Array.from({length: 8}).map((_,i) => <line key={i} x1="0" y1={i*100} x2="1000" y2={i*100}/>)}
          </g>

          {/* RECOGNIZABLE LANDMASSES (HAND-TRACED HIGH FIDELITY) */}
          <g fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1">
            {/* Africa (East/Central) */}
            <path d="M 0 100 L 50 120 L 100 80 L 180 100 L 220 180 L 320 200 L 350 250 L 320 380 L 300 450 L 220 520 L 150 500 L 100 420 L 50 280 L 0 250 Z" />
            
            {/* Saudi Arabia / Middle East */}
            <path d="M 360 210 L 450 180 L 550 180 L 580 280 L 500 350 L 400 320 L 350 240 Z" />
            
            {/* Indian Subcontinent */}
            <path d="M 600 180 L 700 150 L 800 180 L 820 250 L 750 400 L 680 250 L 620 220 Z" />
            
            {/* SE Asia Peninsula */}
            <path d="M 830 250 L 880 280 L 900 380 L 860 380 L 830 280 Z" />
            
            {/* Sumatra / Borneo / Islands */}
            <path d="M 850 400 L 920 480 L 880 500 Z" />
            <path d="M 920 320 L 980 340 L 960 420 L 900 400 Z" />
          </g>

          {/* ARCS */}
          <g strokeDasharray="5 5" fill="none" opacity="0.3">
            <path className="arc" d={`M ${cities.Nairobi.x} ${cities.Nairobi.y} Q 500 100 ${cities.Dhaka.x} ${cities.Dhaka.y}`} stroke={cities.Nairobi.color}/>
            <path className="arc" d={`M ${cities.Dhaka.x} ${cities.Dhaka.y} Q 850 150 ${cities.Singapore.x} ${cities.Singapore.y}`} stroke={cities.Singapore.color}/>
          </g>

          {/* SCANLINE */}
          <rect x="0" y={scanY - 30} width="1000" height="60" fill="url(#scanGrad)"/>

          {/* MARKERS & ULTRA-VISIBLE LABELS */}
          {Object.entries(cities).map(([name, c]) => {
            const isActive = name === selectedCity;
            return (
              <g key={name} style={{ cursor: 'pointer' }} onClick={() => handleCitySelect(name)}>
                {isActive && <circle cx={c.x} cy={c.y} r="15" fill="none" stroke={c.color} strokeWidth="1" className="ping"/>}
                <circle cx={c.x} cy={c.y} r="4" fill={c.color} filter="url(#glow)"/>
                
                {/* LABEL BACKGROUND FOR LEGIBILITY */}
                <rect x={c.x + 12} y={c.y - 25} width="120" height="40" fill="rgba(0,0,0,0.7)" rx="4" opacity={isActive ? 1 : 0.5}/>
                
                <text x={c.x + 20} y={c.y - 8} fill={c.color} style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                  {name.toUpperCase()}
                </text>
                <text x={c.x + 20} y={c.y + 8} fill="rgba(255,255,255,0.4)" style={{ fontSize: 9, fontFamily: 'var(--font-mono)' }}>
                  {c.coords}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* DATA PANEL */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>{activeData.zone}</span>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, px: 12, py: 4, background: `${activeData.color}15`, border: `1px solid ${activeData.color}33`, color: activeData.color, borderRadius: 3 }}>
            {activeData.riskLevel}
          </span>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px 30px' }}>
          {[
            { label: 'POPULATION', value: activeData.population },
            { label: 'AQI INDEX', value: activeData.aqi },
            { label: 'CLIMATE', value: activeData.climate },
            { label: 'VECTOR_IDX', value: activeData.vectorIdx },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.25)', marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-end' }}>
            <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.3)' }}>OUTBREAK_RISK_THRESHOLD</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: activeData.color }}>{outbreakPct}%</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${outbreakPct}%`, background: activeData.color, boxShadow: `0 0 10px ${activeData.color}44`, transition: 'width 1s ease' }}/>
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 8, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.2)' }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#00E5A0', boxShadow: '0 0 4px #00E5A0' }}/>
          UPLINK_STABLE // HCS_MASTER
        </div>
        <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.1)' }}>PROTOCOL_AMX_V3_REGIONAL</div>
      </div>
    </div>
  );
};

export default OneHealthMap;
