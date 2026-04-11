import React, { useState, useEffect, useRef } from 'react';

const OneHealthMap = ({ currentCity, outbreakRisk, setSelectedCityExternal }) => {
  const [selectedCity, setSelectedCity] = useState(currentCity || 'Dhaka');
  const [hoveredCity, setHoveredCity] = useState(null);
  const [scanY, setScanY] = useState(0);
  const [timeStr, setTimeStr] = useState('');
  const frameRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (currentCity) setSelectedCity(currentCity);
  }, [currentCity]);

  // Real-time clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace('GMT', 'UTC'));
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  // Scan line animation
  useEffect(() => {
    let running = true;
    const animate = () => {
      if (!running) return;
      const elapsed = (Date.now() - startTimeRef.current) % 6000;
      setScanY((elapsed / 6000) * 500);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { running = false; cancelAnimationFrame(frameRef.current); };
  }, []);

  const handleCitySelect = (c) => {
    setSelectedCity(c);
    if (setSelectedCityExternal) setSelectedCityExternal(c);
  };

  const cities = {
    Dhaka: {
      x: 695, y: 118,
      color: '#FF3B3B',
      glowColor: 'rgba(255,59,59,0.35)',
      name: 'DHAKA',
      population: '21.0M',
      aqi: 162,
      climate: 'Monsoon',
      riskLevel: 'CRITICAL',
      riskColor: '#FF3B3B',
      baseOutbreak: 0.85,
      coords: '23.81°N, 90.41°E',
      zone: 'SOUTH-ASIA',
      vectorIdx: 94,
    },
    Nairobi: {
      x: 283, y: 257,
      color: '#FF9F1C',
      glowColor: 'rgba(255,159,28,0.3)',
      name: 'NAIROBI',
      population: '4.4M',
      aqi: 45,
      climate: 'Highland',
      riskLevel: 'VECTOR',
      riskColor: '#FF9F1C',
      baseOutbreak: 0.45,
      coords: '1.29°S, 36.82°E',
      zone: 'EAST-AFRICA',
      vectorIdx: 62,
    },
    Singapore: {
      x: 799, y: 242,
      color: '#00E5A0',
      glowColor: 'rgba(0,229,160,0.25)',
      name: 'SINGAPORE',
      population: '5.9M',
      aqi: 25,
      climate: 'Tropical',
      riskLevel: 'NOMINAL',
      riskColor: '#00E5A0',
      baseOutbreak: 0.12,
      coords: '1.35°N, 103.82°E',
      zone: 'SE-ASIA',
      vectorIdx: 18,
    },
  };

  const activeData = cities[selectedCity] || cities.Dhaka;
  const displayOutbreak =
    selectedCity === currentCity && outbreakRisk !== null
      ? outbreakRisk
      : activeData.baseOutbreak;

  const cityKeys = Object.keys(cities);

  // Quadratic bezier arc
  const arc = (x1, y1, x2, y2) => {
    const mx = (x1 + x2) / 2;
    const my = Math.min(y1, y2) - 60;
    return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  };

  // Outbreak bar width
  const outbreakPct = displayOutbreak * 100;

  // Risk badge bg
  const riskBgMap = {
    CRITICAL: 'rgba(255,59,59,0.12)',
    VECTOR: 'rgba(255,159,28,0.12)',
    NOMINAL: 'rgba(0,229,160,0.12)',
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'linear-gradient(180deg, #0a0b0f 0%, #07080c 50%, #0a0b0f 100%)',
      border: '1px solid rgba(255,255,255,0.04)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Subtle top edge glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent 0%, ${activeData.color}33 50%, transparent 100%)`,
        zIndex: 10,
      }}/>

      <style>{`
        @keyframes amx-ping {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(3.5); opacity: 0; }
        }
        @keyframes amx-core-glow {
          0%,100% { filter: brightness(1) drop-shadow(0 0 2px currentColor); }
          50%     { filter: brightness(1.4) drop-shadow(0 0 6px currentColor); }
        }
        @keyframes amx-dash-flow {
          from { stroke-dashoffset: 300; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes amx-data-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes amx-bar-fill {
          from { width: 0%; }
        }
        .amx-ping {
          animation: amx-ping 2.4s cubic-bezier(0,0,0.2,1) infinite;
          transform-origin: center;
          transform-box: fill-box;
        }
        .amx-core {
          animation: amx-core-glow 2s ease-in-out infinite;
        }
        .amx-arc-flow {
          animation: amx-dash-flow 4s linear infinite;
        }
        .amx-row-in {
          animation: amx-data-in 0.35s ease-out both;
        }
        .amx-bar-in {
          animation: amx-bar-fill 0.8s cubic-bezier(0.22,1,0.36,1) both;
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        padding: '14px 20px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div>
          <div style={{
            fontSize: 8, fontFamily: 'var(--font-mono, monospace)',
            color: 'rgba(255,255,255,0.25)', letterSpacing: '0.22em',
            marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{
              display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
              background: activeData.color,
              boxShadow: `0 0 6px ${activeData.color}`,
            }}/>
            GEO_INTELLIGENCE
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {cityKeys.map((city) => {
              const c = cities[city];
              const isActive = city === selectedCity;
              const isHover = city === hoveredCity;
              return (
                <button
                  key={city}
                  onClick={() => handleCitySelect(city)}
                  onMouseEnter={() => setHoveredCity(city)}
                  onMouseLeave={() => setHoveredCity(null)}
                  style={{
                    background: isActive
                      ? `${c.color}0D`
                      : isHover ? 'rgba(255,255,255,0.03)' : 'transparent',
                    border: 'none', cursor: 'pointer', padding: '7px 14px',
                    borderRadius: 4, position: 'relative',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: 9.5, fontWeight: isActive ? 600 : 400,
                    letterSpacing: '0.14em',
                    color: isActive ? c.color : 'rgba(255,255,255,0.35)',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                >
                  {c.name}
                  {isActive && (
                    <span style={{
                      position: 'absolute', bottom: 0, left: '20%', right: '20%',
                      height: 1.5, borderRadius: 1,
                      background: `linear-gradient(90deg, transparent, ${c.color}, transparent)`,
                    }}/>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {/* UTC clock */}
        <div style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: 7.5, color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.1em', textAlign: 'right', lineHeight: 1.6,
          marginTop: 2,
        }}>
          <div>AMX-GEO v2.1</div>
          <div>{timeStr}</div>
        </div>
      </div>

      {/* ── MAP ── */}
      <div style={{
        position: 'relative', width: '100%', height: 220,
        margin: '10px 0 0', overflow: 'hidden',
        background: '#060709',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
      }}>
        <svg
          viewBox="0 0 1000 500"
          preserveAspectRatio="xMidYMid slice"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <defs>
            <filter id="amx-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="amx-glow-strong" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="amx-scan-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(0,200,255,0)" />
              <stop offset="40%" stopColor="rgba(0,200,255,0.06)" />
              <stop offset="50%" stopColor="rgba(0,200,255,0.12)" />
              <stop offset="60%" stopColor="rgba(0,200,255,0.06)" />
              <stop offset="100%" stopColor="rgba(0,200,255,0)" />
            </linearGradient>
            <linearGradient id="arc-grad-0" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF3B3B" stopOpacity="0.3"/>
              <stop offset="50%" stopColor="#FF9F1C" stopOpacity="0.15"/>
              <stop offset="100%" stopColor="#FF9F1C" stopOpacity="0.3"/>
            </linearGradient>
            <linearGradient id="arc-grad-1" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF9F1C" stopOpacity="0.3"/>
              <stop offset="50%" stopColor="#00E5A0" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="#00E5A0" stopOpacity="0.3"/>
            </linearGradient>
            <linearGradient id="arc-grad-2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF3B3B" stopOpacity="0.25"/>
              <stop offset="50%" stopColor="#FF6644" stopOpacity="0.08"/>
              <stop offset="100%" stopColor="#00E5A0" stopOpacity="0.25"/>
            </linearGradient>
          </defs>

          <rect width="1000" height="500" fill="#060709"/>

          <circle
            cx={activeData.x} cy={activeData.y} r="120"
            fill={`url(#atm-${selectedCity})`}
            opacity="0.15"
          />
          <defs>
            <radialGradient id={`atm-${selectedCity}`}>
              <stop offset="0%" stopColor={activeData.color} stopOpacity="0.2"/>
              <stop offset="100%" stopColor={activeData.color} stopOpacity="0"/>
            </radialGradient>
          </defs>

          <g stroke="rgba(255,255,255,0.025)" strokeWidth="0.4" fill="none">
            {Array.from({length: 20}, (_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 26.3} x2="1000" y2={i * 26.3}/>
            ))}
            {Array.from({length: 40}, (_, i) => (
              <line key={`v${i}`} x1={i * 25.6} y1="0" x2={i * 25.6} y2="500"/>
            ))}
          </g>

          <line x1="0" y1="250" x2="1000" y2="250"
            stroke="rgba(0,200,255,0.05)" strokeWidth="0.6"
            strokeDasharray="3 8"/>

          <g fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8">
            {/* Africa Coastline - Zoomed (approx 0E to 50E) */}
            <path d="M 0 50 L 80 80 L 120 150 L 100 220 L 150 280 L 260 250 L 320 220 L 350 260 L 330 380 L 280 450 L 200 480 L 120 450 L 80 400 L 40 300 L 0 250 Z" />
            
            {/* Arabian Peninsula */}
            <path d="M 360 180 L 480 180 L 520 260 L 460 300 L 380 260 L 350 210 Z" />

            {/* India / South Asia Subcontinent */}
            <path d="M 580 140 L 650 130 L 740 140 L 780 180 L 760 250 L 680 380 L 620 250 L 580 200 Z" />

            {/* SE Asia & Indonesia archipelago */}
            <path d="M 790 200 L 830 240 L 840 320 L 790 320 L 775 250 Z" />
            <path d="M 800 340 L 880 400 L 840 430 Z" /> {/* Sumatra approx */}
            <path d="M 890 320 L 960 330 L 980 400 L 920 420 Z" /> {/* Borneo / Sulawesi approx */}
            <path d="M 930 150 L 970 200 L 950 280 Z" /> {/* Philippines approx */}
          </g>

          <g stroke="rgba(0,200,255,0.18)" strokeWidth="1" fill="none">
            <path d="M6 26 L6 6 L26 6"/>
            <path d="M974 6 L994 6 L994 26"/>
            <path d="M994 474 L994 494 L974 494"/>
            <path d="M26 494 L6 494 L6 474"/>
          </g>

          {[
            { a: cities.Dhaka, b: cities.Nairobi, grad: 'arc-grad-0' },
            { a: cities.Nairobi, b: cities.Singapore, grad: 'arc-grad-1' },
            { a: cities.Dhaka, b: cities.Singapore, grad: 'arc-grad-2' },
          ].map(({ a, b, grad }, i) => {
            const involvesActive = (cities[selectedCity] === a || cities[selectedCity] === b);
            return (
              <path
                key={i}
                d={arc(a.x, a.y, b.x, b.y)}
                fill="none"
                stroke={`url(#${grad})`}
                strokeWidth={involvesActive ? 1 : 0.6}
                strokeDasharray="8 6"
                className="amx-arc-flow"
                style={{
                  animationDelay: `${i * 1.1}s`,
                  opacity: involvesActive ? 1 : 0.5,
                }}
              />
            );
          })}

          <rect x="0" y={scanY - 40} width="1000" height="80"
            fill="url(#amx-scan-grad)" opacity="0.8"/>
          <line x1="0" y1={scanY} x2="1000" y2={scanY}
            stroke="rgba(0,200,255,0.15)" strokeWidth="0.6"/>

          {Object.entries(cities).map(([name, c]) => {
            const isActive = name === selectedCity;
            const isHover = name === hoveredCity;
            return (
              <g
                key={name}
                onClick={() => handleCitySelect(name)}
                onMouseEnter={() => setHoveredCity(name)}
                onMouseLeave={() => setHoveredCity(null)}
                style={{ cursor: 'pointer' }}
              >
                {isActive && (
                  <circle cx={c.x} cy={c.y} r="8"
                    fill="none" stroke={c.color} strokeWidth="1.5"
                    className="amx-ping" opacity="0.6"/>
                )}
                <circle cx={c.x} cy={c.y} r={isActive ? 18 : isHover ? 14 : 10}
                  fill={c.color} opacity={isActive ? 0.06 : 0.03}
                  filter="url(#amx-glow-strong)"/>
                <circle cx={c.x} cy={c.y} r={isActive ? 3.5 : isHover ? 3 : 2}
                  fill={c.color}
                  filter={isActive ? 'url(#amx-glow-strong)' : 'url(#amx-glow)'}
                  className={isActive ? 'amx-core' : ''}
                />
                {isActive && (
                  <g stroke={c.color} strokeWidth="0.6" opacity="0.4">
                    <line x1={c.x - 28} y1={c.y} x2={c.x - 10} y2={c.y}/>
                    <line x1={c.x + 10} y1={c.y} x2={c.x + 28} y2={c.y}/>
                    <line x1={c.x} y1={c.y - 28} x2={c.x} y2={c.y - 10}/>
                    <line x1={c.x} y1={c.y + 10} x2={c.x} y2={c.y + 28}/>
                    <line x1={c.x - 20} y1={c.y - 20} x2={c.x - 14} y2={c.y - 20}/>
                    <line x1={c.x - 20} y1={c.y - 20} x2={c.x - 20} y2={c.y - 14}/>
                    <line x1={c.x + 20} y1={c.y - 20} x2={c.x + 14} y2={c.y - 20}/>
                    <line x1={c.x + 20} y1={c.y - 20} x2={c.x + 20} y2={c.y - 14}/>
                    <line x1={c.x - 20} y1={c.y + 20} x2={c.x - 14} y2={c.y + 20}/>
                    <line x1={c.x - 20} y1={c.y + 20} x2={c.x - 20} y2={c.y + 14}/>
                    <line x1={c.x + 20} y1={c.y + 20} x2={c.x + 14} y2={c.y + 20}/>
                    <line x1={c.x + 20} y1={c.y + 20} x2={c.x + 20} y2={c.y + 14}/>
                  </g>
                )}
                <text
                  x={c.x} y={c.y - (isActive ? 34 : 28)}
                  textAnchor="middle"
                  fill={c.color}
                  opacity={isActive ? 1 : isHover ? 0.75 : 0.4}
                  style={{
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: isActive ? 8.5 : 7,
                    letterSpacing: '1.8px',
                    fontWeight: isActive ? 700 : 400,
                  }}
                >
                  {c.name}
                </text>
                {isActive && (
                  <text
                    x={c.x} y={c.y - 24}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.3)"
                    style={{
                      fontFamily: 'var(--font-mono, monospace)', fontSize: 5.5, letterSpacing: '1px',
                    }}
                  >
                    {c.coords}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ padding: '0 20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 0 8px', borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono, monospace)', fontSize: 7,
            color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em',
          }}>
            ZONE {activeData.zone}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono, monospace)', fontSize: 7.5,
            fontWeight: 600, letterSpacing: '0.16em',
            color: activeData.riskColor,
            background: riskBgMap[activeData.riskLevel] || 'transparent',
            padding: '3px 10px', borderRadius: 3,
            border: `1px solid ${activeData.riskColor}22`,
          }}>
            {activeData.riskLevel}
          </span>
        </div>

        {[
          { label: 'POPULATION', value: activeData.population, mono: false },
          { label: 'AQI INDEX',   value: activeData.aqi, mono: true, color: activeData.color },
          { label: 'CLIMATE ZONE', value: activeData.climate, mono: false },
          { label: 'VECTOR INDEX', value: activeData.vectorIdx, mono: true, color: activeData.color },
        ].map((row, i) => (
          <div
            key={row.label}
            className="amx-row-in"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0',
              animationDelay: `${i * 0.06}s`,
            }}
          >
            <span style={{
              fontFamily: 'var(--font-mono, monospace)', fontSize: 7.5,
              color: 'rgba(255,255,255,0.22)', letterSpacing: '0.18em',
            }}>
              {row.label}
            </span>
            <span style={{
              fontFamily: row.mono ? 'var(--font-mono, monospace)' : 'inherit',
              fontSize: row.mono ? 12 : 10.5,
              fontWeight: row.mono ? 600 : 500,
              color: row.color || 'rgba(255,255,255,0.7)',
              letterSpacing: row.mono ? '0.05em' : '0',
            }}>
              {row.value}
            </span>
          </div>
        ))}

        <div style={{ padding: '10px 0 6px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 6,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)', fontSize: 7.5,
              color: 'rgba(255,255,255,0.22)', letterSpacing: '0.18em',
            }}>
              OUTBREAK RISK
            </span>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)', fontSize: 13,
              fontWeight: 700, color: activeData.color,
              letterSpacing: '0.02em',
            }}>
              {outbreakPct.toFixed(1)}%
            </span>
          </div>
          <div style={{
            width: '100%', height: 4, borderRadius: 2,
            background: 'rgba(255,255,255,0.04)',
            overflow: 'hidden', position: 'relative',
          }}>
            <div
              className="amx-bar-in"
              style={{
                height: '100%', borderRadius: 2,
                width: `${outbreakPct}%`,
                background: `linear-gradient(90deg, ${activeData.color}88, ${activeData.color})`,
                boxShadow: `0 0 8px ${activeData.color}44`,
              }}
            />
          </div>
        </div>
      </div>

      <div style={{
        padding: '8px 20px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
              display: 'inline-block', width: 4, height: 4, borderRadius: '50%',
              background: '#00E5A0', boxShadow: '0 0 4px #00E5A0',
          }}/>
          <span style={{
            fontFamily: 'var(--font-mono, monospace)', fontSize: 6.5,
            color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em',
          }}>
            LIVE FEED ACTIVE
          </span>
        </div>
        <span style={{
          fontFamily: 'var(--font-mono, monospace)', fontSize: 6.5,
          color: 'rgba(255,255,255,0.12)', letterSpacing: '0.1em',
        }}>
          HCS_SYNC ✓ · 3 NODES
        </span>
      </div>
    </div>
  );
};

export default OneHealthMap;
