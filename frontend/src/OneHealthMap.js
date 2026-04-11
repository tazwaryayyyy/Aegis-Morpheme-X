import React, { useState, useEffect } from 'react';

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
      x: 680, y: 195,
      color: '#FF4444',
      name: 'DHAKA',
      population: '21.0M',
      aqi: 162,
      climate: 'Monsoon',
      riskLevel: 'HIGH',
      baseOutbreak: 0.85,
    },
    'Nairobi': {
      x: 550, y: 255,
      color: '#FF8C00',
      name: 'NAIROBI',
      population: '4.4M',
      aqi: 45,
      climate: 'Highland',
      riskLevel: 'MODERATE',
      baseOutbreak: 0.45,
    },
    'Singapore': {
      x: 720, y: 240,
      color: '#AAFF00',
      name: 'SINGAPORE',
      population: '5.9M',
      aqi: 25,
      climate: 'Tropical',
      riskLevel: 'LOW',
      baseOutbreak: 0.12,
    }
  };

  const activeData = cities[selectedCity] || cities['Dhaka'];
  const displayOutbreak = (selectedCity === currentCity && outbreakRisk !== null)
    ? outbreakRisk
    : activeData.baseOutbreak;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-surface)' }}>
      {/* CSS Keyframes Injection */}
      <style>{`
        @keyframes amx-pulse {
          0% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.8); opacity: 0.05; }
          100% { transform: scale(1); opacity: 0.15; }
        }
        @keyframes amx-mid-pulse {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0.15; }
          100% { transform: scale(1); opacity: 0.3; }
        }
        @keyframes amx-scanline {
          from { transform: translateY(0); }
          to { transform: translateY(500px); }
        }
        .amx-map-pulse-outer {
          transform-box: fill-box;
          transform-origin: center;
          animation: amx-pulse 2s infinite ease-in-out;
        }
        .amx-map-pulse-mid {
          transform-box: fill-box;
          transform-origin: center;
          animation: amx-mid-pulse 2s infinite ease-in-out;
        }
      `}</style>

      {/* City Tab Selector */}
      <div style={{ padding: '16px 20px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.2em', marginBottom: 12 }}>
          [-] GEO_INTELLIGENCE
        </div>
        <div style={{ display: 'flex' }}>
          {Object.keys(cities).map((city, idx, arr) => {
            const isActive = city === selectedCity;
            const cityColor = cities[city].color;
            return (
              <React.Fragment key={city}>
                <button
                  className="magnetic-btn"
                  onClick={() => handleCitySelect(city)}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em',
                    textTransform: 'uppercase', paddingBottom: 8,
                    color: isActive ? 'inherit' : 'var(--text-secondary)',
                    borderBottom: isActive ? `1px solid ${cityColor}` : '1px solid transparent',
                    outline: 'none', transition: 'color 0.2s',
                  }}
                >
                  <span style={{ color: isActive ? cityColor : 'inherit' }}>
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

      {/* SVG Map Area */}
      <div style={{ position: 'relative', width: '100%', height: 200, background: '#0a0a0a', overflow: 'hidden' }}>
        <svg 
          viewBox="0 0 1000 500" 
          preserveAspectRatio="xMidYMid slice"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          {/* World Base */}
          <rect width="1000" height="500" fill="#0a0a0a" />
          
          <g fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5">
            {/* Americas */}
            <path d="M120 120 L300 120 L280 250 L340 330 L300 460 L200 460 L220 300 L120 250 Z" />
            {/* Eurasia & Africa */}
            <path d="M440 120 L880 120 L940 300 L760 360 L680 470 L520 470 L480 320 L400 280 L420 180 Z" />
            {/* Australia */}
            <path d="M820 380 L940 380 L940 460 L820 460 Z" />
          </g>

          {/* Corner Brackets */}
          <g stroke="rgba(0,200,255,0.2)" strokeWidth="1">
            <path d="M10 30 L10 10 L30 10" fill="none" />
            <path d="M970 10 L990 10 L990 30" fill="none" />
            <path d="M990 470 L990 490 L970 490" fill="none" />
            <path d="M30 490 L10 490 L10 470" fill="none" />
          </g>

          {/* Scan Line */}
          <line 
            x1="0" y1="0" x2="1000" y2="0" 
            stroke="rgba(0,200,255,0.15)" strokeWidth="1"
            style={{ animation: 'amx-scanline 4s linear infinite' }}
          />

          {/* City Markers */}
          {Object.entries(cities).map(([name, coords]) => {
            const isActive = name === selectedCity;
            return (
              <g key={name} onClick={() => handleCitySelect(name)} style={{ cursor: 'pointer' }}>
                <circle 
                  className="amx-map-pulse-outer" 
                  cx={coords.x} cy={coords.y} r={16} 
                  fill={coords.color} 
                  opacity={isActive ? 0.35 : 0.15} 
                />
                <circle 
                  className="amx-map-pulse-mid" 
                  cx={coords.x} cy={coords.y} r={8} 
                  fill={coords.color} 
                  opacity={0.3} 
                  style={{ animationDelay: '0.3s' }}
                />
                <circle 
                  cx={coords.x} cy={coords.y} r={isActive ? 5 : 3} 
                  fill={coords.color} 
                  opacity={1} 
                />
                <text 
                  x={coords.x} y={coords.y - 22} 
                  textAnchor="middle" 
                  style={{ 
                    fontFamily: 'monospace', fontSize: 10, fill: coords.color, 
                    letterSpacing: 2, fontWeight: isActive ? 'bold' : 'normal' 
                  }}
                >
                  {name.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Data Table */}
      <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
          <span className="dense-label">POPULATION</span>
          <span className="dense-val">{activeData.population}</span>
        </div>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
          <span className="dense-label">AQI</span>
          <span className="dense-val" style={{ color: activeData.color }}>{activeData.aqi}</span>
        </div>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
          <span className="dense-label">CLIMATE</span>
          <span className="dense-val">{activeData.climate}</span>
        </div>
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
          <span className="dense-label">RISK_LEVEL</span>
          <span className="dense-val">{activeData.riskLevel}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
          <span className="dense-label">OUTBREAK_%</span>
          <span className="dense-val" style={{ color: activeData.color }}>{(displayOutbreak * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default OneHealthMap;
