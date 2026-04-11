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
      x: 751, y: 184,
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
      x: 602, y: 253,
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
      x: 788, y: 246,
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

          <g fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6">
            {/* North America */}
            <path d="M135 80 L155 72 L178 66 L200 64 L222 66 L242 70 L258 76 L274 84 L286 94 L296 106 L304 120 L310 136 L314 152 L312 168 L306 182 L316 194 L322 208 L320 224 L312 240 L300 256 L286 272 L272 290 L260 310 L250 332 L242 352 L234 366 L224 372 L216 365 L208 348 L198 326 L186 304 L172 280 L158 256 L146 232 L134 208 L122 186 L114 166 L110 148 L112 130 L118 114 L126 98 Z"/>
            <path d="M246 342 L256 350 L264 366 L260 380 L250 384 L240 374 L238 358 Z"/>
            <path d="M232 370 L242 368 L252 374 L258 388 L268 400 L274 410 L268 416 L258 412 L248 404 L240 392 L234 382 Z"/>
            <path d="M310 42 L332 36 L356 38 L378 44 L392 54 L396 68 L388 82 L372 92 L352 96 L332 94 L318 86 L308 72 Z"/>
            {/* South America */}
            <path d="M238 376 L260 366 L282 362 L304 366 L322 374 L336 388 L344 406 L350 428 L352 452 L346 474 L334 490 L316 498 L296 496 L278 486 L262 470 L250 450 L240 428 L234 406 L232 390 Z"/>
            {/* Europe */}
            <path d="M440 92 L456 84 L474 80 L492 78 L508 82 L522 90 L532 102 L538 118 L536 134 L528 148 L516 158 L500 164 L482 166 L466 162 L452 154 L442 142 L436 126 L436 108 Z"/>
            <path d="M472 78 L482 64 L492 54 L502 50 L510 56 L512 68 L506 76 L496 80 L484 80 Z"/>
            <path d="M416 94 L422 86 L428 88 L430 98 L426 106 L418 108 L414 102 Z"/>
            {/* Africa */}
            <path d="M446 174 L472 164 L500 160 L528 162 L554 170 L574 184 L590 204 L600 228 L604 256 L604 286 L598 316 L586 346 L570 374 L550 400 L530 422 L512 436 L494 442 L478 438 L464 424 L452 404 L442 378 L436 348 L432 316 L430 284 L432 252 L436 222 L440 196 Z"/>
            <path d="M624 316 L632 306 L638 318 L640 338 L636 356 L628 360 L620 346 L618 328 Z"/>
            {/* Middle East */}
            <path d="M544 140 L568 134 L594 132 L618 138 L634 150 L642 166 L636 184 L622 196 L602 204 L578 206 L558 200 L544 186 L538 168 L538 152 Z"/>
            {/* Russia / Central Asia */}
            <path d="M540 90 L576 82 L616 76 L658 72 L700 70 L742 72 L782 78 L818 86 L848 96 L872 110 L890 126 L900 146 L898 166 L888 182 L872 194 L852 204 L828 212 L802 218 L778 222 L754 226 L730 228 L706 224 L682 218 L658 212 L634 206 L612 200 L592 194 L574 186 L558 174 L546 160 L540 142 L536 120 L536 104 Z"/>
            {/* India & SE Asia */}
            <path d="M656 218 L680 210 L704 212 L724 220 L736 236 L740 256 L738 278 L728 300 L714 318 L696 328 L678 324 L664 308 L656 288 L652 266 L650 244 Z"/>
            <path d="M698 328 L706 324 L710 336 L704 344 L696 340 Z"/>
            <path d="M742 244 L758 248 L772 258 L782 274 L784 294 L778 312 L768 324 L756 326 L748 316 L744 296 L740 272 L738 256 Z"/>
            {/* East Asia & Japan */}
            <path d="M778 178 L792 172 L804 180 L808 194 L800 204 L788 206 L780 198 Z"/>
            <path d="M880 130 L890 122 L898 126 L900 138 L896 152 L888 162 L880 158 L876 146 L876 136 Z"/>
            {/* Islands */}
            <path d="M798 272 L818 266 L834 272 L838 284 L828 294 L810 296 L800 288 Z"/>
            <path d="M844 276 L864 270 L878 278 L874 292 L860 298 L846 292 Z"/>
            <path d="M880 282 L896 278 L904 288 L896 298 L882 296 Z"/>
            <path d="M808 300 L828 296 L836 308 L826 318 L810 316 Z"/>
            <path d="M842 300 L858 298 L864 310 L854 318 L842 314 Z"/>
            {/* Australia */}
            <path d="M800 340 L830 330 L864 326 L900 328 L930 338 L950 356 L956 378 L952 404 L940 426 L920 442 L894 450 L866 452 L838 446 L814 434 L798 416 L790 394 L788 370 L792 352 Z"/>
            <path d="M882 458 L894 454 L900 464 L894 474 L882 472 L878 466 Z"/>
            <path d="M958 388 L966 380 L972 388 L970 402 L964 412 L956 408 L954 396 Z"/>
            <path d="M960 416 L966 412 L970 420 L964 428 L958 424 Z"/>
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
