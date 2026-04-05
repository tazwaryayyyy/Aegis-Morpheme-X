import React, { useState, useEffect } from 'react';
import './index.css';

const OneHealthMap = ({ currentCity, outbreakRisk, setSelectedCityExternal }) => {
  const [selectedCity, setSelectedCity] = useState(currentCity || 'Dhaka');

  useEffect(() => {
    if (currentCity) setSelectedCity(currentCity);
  }, [currentCity]);

  const handleCitySelect = (c) => {
    setSelectedCity(c);
    if (setSelectedCityExternal) setSelectedCityExternal(c);
  };

  const cities = {
    'Dhaka': {
      cx: 230, cy: 60,
      color: '#FF2A2A', // Pure explicit red 
      name: 'DHAKA',
      population: '21.0M',
      aqi: 162,
      climate: 'Monsoon',
      riskLevel: 'HIGH',
      baseOutbreak: 0.85
    },
    'Nairobi': {
      cx: 100, cy: 160,
      color: '#FF6200', // Orange explicit
      name: 'NAIROBI',
      population: '4.4M',
      aqi: 45,
      climate: 'Highland',
      riskLevel: 'MODERATE',
      baseOutbreak: 0.45
    },
    'Singapore': {
      cx: 260, cy: 155,
      color: '#C8FF00', // Acid 
      name: 'SINGAPORE',
      population: '5.9M',
      aqi: 25,
      climate: 'Tropical',
      riskLevel: 'LOW',
      baseOutbreak: 0.12
    }
  };

  const activeData = cities[selectedCity] || cities['Dhaka'];
  const displayOutbreak = (selectedCity === currentCity && outbreakRisk !== null)
    ? outbreakRisk
    : activeData.baseOutbreak;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-surface)' }}>
      {/* City Tab Selector */}
      <div style={{ padding: '16px 20px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.2em', marginBottom: 12 }}>
          [-] GEO_INTELLIGENCE
        </div>
        <div style={{ display: 'flex' }}>
          {Object.keys(cities).map((city, idx, arr) => {
            const isActive = city === selectedCity;
            return (
              <React.Fragment key={city}>
                <button
                  className="magnetic-btn"
                  data-cursor={city === 'Dhaka' ? 'red' : city === 'Nairobi' ? 'orange' : 'acid'}
                  onClick={() => handleCitySelect(city)}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'none',
                    fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em',
                    textTransform: 'uppercase', paddingBottom: 8,
                    color: isActive ? 'inherit' : 'var(--text-secondary)',
                    borderBottom: isActive ? `1px solid ${cities[city].color}` : '1px solid transparent',
                    outline: 'none', transition: 'color 0.2s',
                  }}
                >
                  <span style={{ color: isActive ? cities[city].color : 'inherit' }}>
                    {cities[city].name}
                  </span>
                </button>
                {idx < arr.length - 1 && (
                  <span style={{ color: 'rgba(255,255,255,0.1)', margin: '0 12px', fontSize: 9 }}>|</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* SVG Network Network Area */}
      <div style={{ width: '100%', height: 220, position: 'relative', overflow: 'hidden' }}>
        
        {/* Dynamic Keyframes for minimal node emission */}
        <style dangerouslySetInnerHTML={{__html:`
          @keyframes emitParticle {
            0% { transform: translateY(0) scale(1); opacity: 0.8; }
            100% { transform: translateY(-30px) scale(0); opacity: 0; }
          }
        `}} />

        <svg viewBox="0 0 320 220" style={{ width: '100%', height: '100%', display: 'block' }}>
          <defs>
            <pattern id="dotGridNet" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="0.6" fill="rgba(255,255,255,0.04)" />
            </pattern>
            {Object.entries(cities).map(([name, data]) => (
              <radialGradient id={`glow-${name}`} key={name}>
                <stop offset="0%" stopColor={data.color} stopOpacity="0.06" />
                <stop offset="100%" stopColor={data.color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>

          {/* Background pattern */}
          <rect width="100%" height="100%" fill="url(#dotGridNet)" />

          {/* Base Connection Lines (Static, No confusing traveling dots) */}
          <line x1={cities.Dhaka.cx} y1={cities.Dhaka.cy} x2={cities.Singapore.cx} y2={cities.Singapore.cy} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} strokeDasharray="3 5" />
          <line x1={cities.Singapore.cx} y1={cities.Singapore.cy} x2={cities.Nairobi.cx} y2={cities.Nairobi.cy} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} strokeDasharray="3 5" />
          <line x1={cities.Nairobi.cx} y1={cities.Nairobi.cy} x2={cities.Dhaka.cx} y2={cities.Dhaka.cy} stroke="rgba(255,255,255,0.06)" strokeWidth={0.5} strokeDasharray="3 5" />

          {/* Halos */}
          {Object.entries(cities).map(([name, data]) => {
            const isSelected = name === selectedCity;
            return (
              <circle
                key={`halo-${name}`}
                cx={data.cx} cy={data.cy} r={40}
                fill={`url(#glow-${name})`}
                style={{ opacity: isSelected ? 1 : 0.02, transition: 'opacity 0.4s' }}
                pointerEvents="none"
              />
            );
          })}

          {/* City Nodes */}
          {Object.entries(cities).map(([name, data]) => {
            const isSelected = name === selectedCity;
            let nodeColor = data.color;

            // Live override if risk is actively tracked
            if (name === currentCity && outbreakRisk !== null) {
               nodeColor = outbreakRisk > 0.75 ? '#FF2A2A' : (outbreakRisk > 0.3 ? '#FF6200' : '#C8FF00');
            }

            return (
              <g key={name} style={{ transition: 'opacity 0.3s' }}>
                
                {/* Minimal Local Emission Particles */}
                {isSelected && (
                  <g style={{ transformOrigin: `${data.cx}px ${data.cy}px` }}>
                    <circle cx={data.cx - 6} cy={data.cy - 6} r={1.5} fill={nodeColor} style={{ animation: 'emitParticle 2s infinite ease-out' }} pointerEvents="none" />
                    <circle cx={data.cx + 8} cy={data.cy - 2} r={1} fill={nodeColor} style={{ animation: 'emitParticle 2.5s infinite ease-out 0.8s' }} pointerEvents="none" />
                    <circle cx={data.cx - 2} cy={data.cy + 6} r={2} fill={nodeColor} style={{ animation: 'emitParticle 3s infinite ease-out 1.5s' }} pointerEvents="none" />
                  </g>
                )}
                
                {/* Outer fixed ring */}
                <circle
                  cx={data.cx} cy={data.cy}
                  r={22} fill="none" stroke={nodeColor}
                  strokeWidth={isSelected ? 1.5 : 0.5}
                  opacity={isSelected ? 1 : 0.4}
                  style={{ transition: 'all 0.3s' }}
                  pointerEvents="none"
                />
                
                {/* Inner circle fill */}
                <circle
                  cx={data.cx} cy={data.cy}
                  r={14} fill={nodeColor} fillOpacity={0.08}
                  stroke={nodeColor} strokeWidth={1}
                  pointerEvents="none"
                />
                
                {/* Core dot */}
                <circle cx={data.cx} cy={data.cy} r={4} fill={nodeColor} pointerEvents="none" />
                
                {/* Labels */}
                <text
                  x={data.cx} y={data.cy - 30}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)" fontSize="9"
                  fill="rgba(255,255,255,0.6)" letterSpacing="0.15em"
                  style={{ pointerEvents: 'none' }}
                >
                  {name.toUpperCase()}
                </text>
                
                <text
                  x={data.cx} y={data.cy + 30}
                  textAnchor="middle"
                  fontFamily="var(--font-mono)" fontSize="8"
                  fill={nodeColor}
                  style={{ pointerEvents: 'none' }}
                >
                  {(name === currentCity && outbreakRisk !== null)
                    ? `${(outbreakRisk * 100).toFixed(1)}%`
                    : `${(data.baseOutbreak * 100).toFixed(1)}%`}
                </text>

                {/* Clickable Area */}
                <circle 
                  className="magnetic-btn"
                  data-cursor={name === 'Dhaka' ? 'red' : name === 'Nairobi' ? 'orange' : 'acid'}
                  cx={data.cx} cy={data.cy} 
                  r={28} fill="transparent" cursor="none"
                  onClick={() => handleCitySelect(name)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Data Table */}
      <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
          <span className="dense-label">POPULATION</span>
          <span className="dense-val" style={{ opacity: 1, transition: 'opacity 0.15s' }}>{activeData.population}</span>
        </div>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
          <span className="dense-label">AQI</span>
          <span className="dense-val text-cyan" style={{ color: activeData.color, opacity: 1, transition: 'opacity 0.15s' }}>{activeData.aqi}</span>
        </div>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
          <span className="dense-label">CLIMATE</span>
          <span className="dense-val" style={{ opacity: 1, transition: 'opacity 0.15s' }}>{activeData.climate}</span>
        </div>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
          <span className="dense-label">RISK_LEVEL</span>
          <span className="dense-val" style={{ opacity: 1, transition: 'opacity 0.15s' }}>{activeData.riskLevel}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
          <span className="dense-label">OUTBREAK_%</span>
          <span className="dense-val text-cyan" style={{ color: activeData.color, opacity: 1, transition: 'opacity 0.15s' }}>{(displayOutbreak * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default OneHealthMap;
