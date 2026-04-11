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

  // Equirectangular projection: viewBox 0 0 1000 500
  // x = (lng + 180) / 360 * 1000
  // y = (90 - lat) / 180 * 500
  const cities = {
    Dhaka: {
      x: 751, y: 184,
      color: '#FF4444',
      name: 'DHAKA',
      population: '21.0M',
      aqi: 162,
      climate: 'Monsoon',
      riskLevel: 'HIGH',
      baseOutbreak: 0.85,
    },
    Nairobi: {
      x: 602, y: 253,
      color: '#FF8C00',
      name: 'NAIROBI',
      population: '4.4M',
      aqi: 45,
      climate: 'Highland',
      riskLevel: 'MODERATE',
      baseOutbreak: 0.45,
    },
    Singapore: {
      x: 788, y: 246,
      color: '#AAFF00',
      name: 'SINGAPORE',
      population: '5.9M',
      aqi: 25,
      climate: 'Tropical',
      riskLevel: 'LOW',
      baseOutbreak: 0.12,
    },
  };

  const activeData = cities[selectedCity] || cities.Dhaka;
  const displayOutbreak =
    selectedCity === currentCity && outbreakRisk !== null
      ? outbreakRisk
      : activeData.baseOutbreak;

  const arc = (x1, y1, x2, y2) => {
    const mx = (x1 + x2) / 2;
    const my = Math.min(y1, y2) - 55;
    return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
  };

  const cityKeys = Object.keys(cities);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-surface)' }}>
      <style>{`
        @keyframes amx-pulse-outer {
          0%,100% { r: 14; opacity: 0.18; }
          50% { r: 24; opacity: 0.04; }
        }
        @keyframes amx-pulse-mid {
          0%,100% { r: 7; opacity: 0.4; }
          50% { r: 13; opacity: 0.12; }
        }
        @keyframes amx-scan {
          from { transform: translateY(0px); }
          to   { transform: translateY(500px); }
        }
        @keyframes amx-dash {
          from { stroke-dashoffset: 200; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes amx-blink {
          0%,100% { opacity: 0.7; }
          50% { opacity: 0.15; }
        }
        .amx-outer { animation: amx-pulse-outer 2.5s ease-in-out infinite; }
        .amx-mid   { animation: amx-pulse-mid 2.5s ease-in-out infinite 0.4s; }
        .amx-scan  { animation: amx-scan 5s linear infinite; }
        .amx-arc   { animation: amx-dash 3s linear infinite; }
        .amx-blink { animation: amx-blink 1.4s ease-in-out infinite; }
      `}</style>

      {/* Tabs */}
      <div style={{ padding: '16px 20px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '0.2em', marginBottom: 12 }}>
          [-] GEO_INTELLIGENCE
        </div>
        <div style={{ display: 'flex' }}>
          {cityKeys.map((city, idx) => {
            const isActive = city === selectedCity;
            const cc = cities[city].color;
            return (
              <React.Fragment key={city}>
                <button
                  className="magnetic-btn"
                  onClick={() => handleCitySelect(city)}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em',
                    textTransform: 'uppercase', paddingBottom: 8,
                    color: isActive ? cc : 'var(--text-secondary)',
                    borderBottom: isActive ? `1px solid ${cc}` : '1px solid transparent',
                    outline: 'none', transition: 'color 0.2s',
                  }}
                >
                  {cities[city].name}
                </button>
                {idx < cityKeys.length - 1 && (
                  <span style={{ color: 'rgba(255,255,255,0.1)', margin: '0 12px', fontSize: 9 }}>|</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* SVG Map */}
      <div style={{ position: 'relative', width: '100%', height: 210, overflow: 'hidden', background: '#060608' }}>
        <svg
          viewBox="0 0 1000 500"
          preserveAspectRatio="xMidYMid slice"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          {/* Background */}
          <rect width="1000" height="500" fill="#060608"/>

          {/* Grid */}
          <g stroke="rgba(255,255,255,0.035)" strokeWidth="0.5" fill="none">
            {[83,166,249,332,415,498].map(y => (
              <line key={y} x1="0" y1={y} x2="1000" y2={y}/>
            ))}
            {[0,111,222,333,444,555,666,777,888,999].map(x => (
              <line key={x} x1={x} y1="0" x2={x} y2="500"/>
            ))}
          </g>

          {/* Equator */}
          <line x1="0" y1="250" x2="1000" y2="250" stroke="rgba(0,200,255,0.07)" strokeWidth="0.8" strokeDasharray="4 6"/>

          {/* ── CONTINENTS ── */}
          <g fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8">

            {/* Greenland */}
            <path d="M305 48 L355 42 L392 52 L398 72 L380 90 L350 98 L318 92 L303 72 Z"/>

            {/* North America */}
            <path d="
              M148 78 L195 68 L240 72 L268 82 L292 98 L308 118
              L318 145 L308 172 L322 192 L318 218 L298 245
              L272 272 L255 308 L242 345 L228 368 L212 358
              L198 328 L178 298 L158 262 L138 228
              L118 195 L108 165 L112 138 L122 112 L135 92 Z
            "/>
            {/* Florida / Yucatan nub */}
            <path d="M248 345 L262 355 L268 375 L255 388 L242 375 L238 358 Z"/>

            {/* South America */}
            <path d="
              M235 358 L272 342 L305 348 L328 368 L340 398
              L348 432 L338 468 L315 492 L285 496 L258 484
              L238 458 L228 428 L222 395 L228 368 Z
            "/>

            {/* Europe */}
            <path d="
              M438 88 L468 80 L498 78 L522 88 L538 105
              L542 128 L528 148 L508 160 L482 165
              L458 158 L442 142 L434 122 L436 102 Z
            "/>
            {/* Scandinavia */}
            <path d="M468 78 L478 60 L488 52 L500 58 L508 72 L498 78 Z"/>
            {/* UK blob */}
            <path d="M418 95 L428 88 L432 100 L424 108 L416 102 Z"/>

            {/* Africa */}
            <path d="
              M442 168 L508 158 L552 165 L585 188 L598 222
              L602 258 L596 295 L578 338 L555 382
              L528 422 L505 442 L482 435 L460 405
              L444 362 L434 315 L428 268 L432 222
              L436 192 Z
            "/>
            {/* Madagascar */}
            <path d="M622 318 L632 308 L638 332 L635 355 L625 358 L618 340 Z"/>

            {/* Middle East / Arabian Peninsula */}
            <path d="
              M542 138 L595 132 L628 148 L638 168 L625 192
              L598 202 L568 198 L548 182 L538 162 Z
            "/>

            {/* Central Asia / Russia (simplified top) */}
            <path d="
              M538 88 L620 75 L700 72 L778 78 L838 88
              L882 102 L912 122 L928 148 L915 172
              L885 188 L848 198 L818 208 L788 218
              L762 228 L735 232 L705 225 L678 218
              L652 212 L625 205 L598 198 L572 188
              L552 172 L540 155 L535 132 L536 108 Z
            "/>

            {/* Indian subcontinent */}
            <path d="
              M652 215 L695 208 L728 218 L738 245
              L735 272 L718 302 L698 322 L675 318
              L658 292 L648 262 L648 238 Z
            "/>

            {/* SE Asia peninsula */}
            <path d="
              M738 242 L768 248 L782 268 L778 298
              L762 318 L748 312 L742 288 L740 262 Z
            "/>

            {/* Indonesia / Borneo blobs */}
            <path d="M795 268 L825 262 L838 275 L828 290 L802 292 Z"/>
            <path d="M845 278 L868 272 L878 285 L865 295 L848 292 Z"/>
            <path d="M808 298 L832 295 L838 310 L822 318 L808 312 Z"/>

            {/* Japan */}
            <path d="M878 135 L888 128 L895 138 L890 152 L878 155 L872 145 Z"/>

            {/* Australia */}
            <path d="
              M798 335 L855 325 L905 332 L938 352 L948 378
              L942 412 L918 438 L888 448 L855 448
              L822 435 L800 408 L790 378 L792 352 Z
            "/>
            {/* Tasmania */}
            <path d="M878 455 L892 452 L895 465 L882 470 L872 462 Z"/>
            {/* New Zealand */}
            <path d="M955 385 L962 378 L968 392 L962 405 L954 398 Z"/>

          </g>

          {/* Corner brackets */}
          <g stroke="rgba(0,200,255,0.28)" strokeWidth="1.2" fill="none">
            <path d="M8 28 L8 8 L28 8"/>
            <path d="M972 8 L992 8 L992 28"/>
            <path d="M992 472 L992 492 L972 492"/>
            <path d="M28 492 L8 492 L8 472"/>
          </g>

          {/* Arc connections */}
          {[
            [cities.Dhaka, cities.Nairobi],
            [cities.Nairobi, cities.Singapore],
            [cities.Dhaka, cities.Singapore],
          ].map(([a, b], i) => (
            <path
              key={i}
              d={arc(a.x, a.y, b.x, b.y)}
              fill="none"
              stroke="rgba(0,200,255,0.14)"
              strokeWidth="0.8"
              strokeDasharray="6 4"
              className="amx-arc"
              style={{ animationDelay: `${i * 0.9}s` }}
            />
          ))}

          {/* Scan line */}
          <line
            x1="0" y1="0" x2="1000" y2="0"
            stroke="rgba(0,200,255,0.1)" strokeWidth="1.5"
            className="amx-scan"
          />

          {/* City markers */}
          {Object.entries(cities).map(([name, c]) => {
            const isActive = name === selectedCity;
            return (
              <g key={name} onClick={() => handleCitySelect(name)} style={{ cursor: 'pointer' }}>
                {/* Outer pulse */}
                <circle
                  cx={c.x} cy={c.y} r="14"
                  fill={c.color}
                  opacity={isActive ? 0.22 : 0.1}
                  className="amx-outer"
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
                {/* Mid pulse */}
                <circle
                  cx={c.x} cy={c.y} r="7"
                  fill={c.color} opacity="0.35"
                  className="amx-mid"
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                />
                {/* Core */}
                <circle cx={c.x} cy={c.y} r={isActive ? 4 : 2.5} fill={c.color}/>

                {/* Active: blinking ring + crosshair */}
                {isActive && <>
                  <circle
                    cx={c.x} cy={c.y} r="6"
                    fill="none" stroke={c.color} strokeWidth="1"
                    className="amx-blink"
                  />
                  <g stroke={c.color} strokeWidth="0.8" opacity="0.45">
                    <line x1={c.x-22} y1={c.y} x2={c.x-10} y2={c.y}/>
                    <line x1={c.x+10} y1={c.y} x2={c.x+22} y2={c.y}/>
                    <line x1={c.x} y1={c.y-22} x2={c.x} y2={c.y-10}/>
                    <line x1={c.x} y1={c.y+10} x2={c.x} y2={c.y+22}/>
                  </g>
                </>}

                {/* Label */}
                <text
                  x={c.x} y={c.y - 26}
                  textAnchor="middle"
                  fill={c.color}
                  opacity={isActive ? 1 : 0.55}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: isActive ? 9 : 7.5,
                    letterSpacing: 1.5,
                    fontWeight: isActive ? 'bold' : 'normal',
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
        {[
          { label: 'POPULATION', value: activeData.population, color: null },
          { label: 'AQI',        value: activeData.aqi,        color: activeData.color },
          { label: 'CLIMATE',    value: activeData.climate,    color: null },
          { label: 'RISK_LEVEL', value: activeData.riskLevel,  color: null },
          { label: 'OUTBREAK_%', value: `${(displayOutbreak * 100).toFixed(1)}%`, color: activeData.color },
        ].map((row, i, arr) => (
          <div
            key={row.label}
            style={{
              borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              display: 'flex', justifyContent: 'space-between', padding: '10px 0',
            }}
          >
            <span className="dense-label">{row.label}</span>
            <span className="dense-val" style={row.color ? { color: row.color } : {}}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OneHealthMap;
