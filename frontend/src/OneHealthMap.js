import React, { useState, useEffect, useRef } from 'react';

// ─── Geo helpers ──────────────────────────────────────────────────────────────
// Projection covers 0°–120°E  |  40°N–40°S  →  viewBox 0 0 1000 666
const toX = (lon) => (lon / 120) * 1000;
const toY = (lat) => ((40 - lat) / 80) * 666;

// ─── City definitions (corrected coordinates) ─────────────────────────────────
const CITIES = {
  Dhaka: {
    lon: 90.41, lat: 23.81,
    color: '#FF3B3B',
    name: 'DHAKA',
    population: '21.0M',
    aqi: 162,
    climate: 'Monsoon',
    riskLevel: 'CRITICAL',
    baseOutbreak: 0.85,
    coords: '23.81°N 90.41°E',
    zone: 'SOUTH-ASIA',
    vectorIdx: 94,
    labelSide: 'right',
  },
  Nairobi: {
    lon: 36.82, lat: -1.29,
    color: '#FF9F1C',
    name: 'NAIROBI',
    population: '4.4M',
    aqi: 45,
    climate: 'Highland',
    riskLevel: 'VECTOR',
    baseOutbreak: 0.45,
    coords: '1.29°S 36.82°E',
    zone: 'EAST-AFRICA',
    vectorIdx: 62,
    labelSide: 'right',
  },
  Singapore: {
    lon: 103.82, lat: 1.35,
    color: '#00E5A0',
    name: 'SINGAPORE',
    population: '5.9M',
    aqi: 25,
    climate: 'Tropical',
    riskLevel: 'NOMINAL',
    baseOutbreak: 0.12,
    coords: '1.35°N 103.82°E',
    zone: 'SE-ASIA',
    vectorIdx: 18,
    labelSide: 'left', // near right edge → flip label left
  },
};

// Pre-compute pixel positions once
Object.values(CITIES).forEach(c => {
  c.x = toX(c.lon);
  c.y = toY(c.lat);
});

// ─── Landmass paths (traced from real geography, this projection) ─────────────
// Africa (relevant eastern portion + horn + east coast)
const AFRICA = `
  M 0,83
  L 42,67  L 83,75  L 125,58  L 150,75
  L 167,100 L 183,108
  L 200,125 L 233,133 L 267,125
  L 292,150 L 308,175 L 325,192
  L 333,208 L 342,233 L 350,258
  L 342,283 L 325,308 L 317,333
  L 308,367 L 300,400 L 292,433
  L 283,458 L 267,483 L 250,508
  L 233,525 L 208,533 L 183,525
  L 158,508 L 133,483 L 117,458
  L 100,425 L 83,392 L 67,358
  L 50,325  L 42,292 L 33,258
  L 25,225  L 17,192 L 8,158
  L 0,133 Z
`;

// Madagascar
const MADAGASCAR = `
  M 275,383 L 283,367 L 292,375 L 300,392
  L 308,408 L 308,425 L 300,433 L 292,425
  L 283,408 Z
`;

// Arabian Peninsula
const ARABIA = `
  M 367,158 L 417,142 L 467,133 L 500,150
  L 533,158 L 550,175 L 558,200
  L 550,225 L 533,250 L 517,267
  L 500,283 L 467,292 L 442,283
  L 417,267 L 400,250 L 383,233
  L 375,208 L 367,183 Z
`;

// Indian Subcontinent
const INDIA = `
  M 567,133 L 600,117 L 633,108 L 667,117
  L 700,125 L 725,133 L 742,150
  L 750,175 L 758,200 L 750,225
  L 733,258 L 717,283 L 700,308
  L 683,325 L 667,342 L 650,325
  L 633,300 L 617,275 L 608,250
  L 600,225 L 592,200 L 583,175
  L 575,158 Z
`;

// Sri Lanka
const SRI_LANKA = `
  M 667,350 L 675,342 L 683,350
  L 683,367 L 675,375 L 667,367 Z
`;

// Indochina Peninsula (Myanmar → Thailand → Malay)
const INDOCHINA = `
  M 800,125 L 833,133 L 858,150
  L 875,175 L 883,200 L 875,225
  L 858,250 L 850,275 L 858,292
  L 867,308 L 867,325 L 858,333
  L 850,325 L 842,308 L 833,292
  L 833,275 L 825,258 L 817,242
  L 808,225 L 800,200 L 792,175
  L 783,158 L 792,142 Z
`;

// Sumatra
const SUMATRA = `
  M 808,375 L 833,358 L 858,367
  L 883,383 L 900,400 L 900,417
  L 883,425 L 858,417 L 833,400 L 817,392 Z
`;

// Borneo (partial, within view)
const BORNEO = `
  M 900,308 L 933,300 L 967,308
  L 983,325 L 983,350 L 967,367
  L 950,375 L 925,367 L 908,350
  L 900,333 Z
`;

// Java (partial)
const JAVA = `
  M 858,442 L 892,433 L 925,442
  L 942,450 L 925,458 L 892,458 L 867,450 Z
`;

// ─── Component ────────────────────────────────────────────────────────────────
const OneHealthMap = ({ currentCity, outbreakRisk, setSelectedCityExternal }) => {
  const [selectedCity, setSelectedCity] = useState(currentCity || 'Dhaka');
  const [hoveredCity, setHoveredCity] = useState(null);
  const [timeStr, setTimeStr] = useState('');
  const [scanY, setScanY] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(Date.now());
  const SCAN_SPEED = 5000;

  useEffect(() => { if (currentCity) setSelectedCity(currentCity); }, [currentCity]);

  useEffect(() => {
    const tick = () => setTimeStr(new Date().toUTCString().replace('GMT', 'UTC'));
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const animate = () => {
      const elapsed = (Date.now() - startRef.current) % SCAN_SPEED;
      setScanY((elapsed / SCAN_SPEED) * 666);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const handleCitySelect = (c) => {
    setSelectedCity(c);
    setSelectedCityExternal?.(c);
  };

  const active = CITIES[selectedCity] || CITIES.Dhaka;
  const displayOutbreak =
    selectedCity === currentCity && outbreakRisk !== null
      ? outbreakRisk
      : active.baseOutbreak;
  const outbreakPct = (displayOutbreak * 100).toFixed(1);

  // Risk bar colour segments
  const riskGradient =
    displayOutbreak > 0.7 ? '#FF3B3B' :
    displayOutbreak > 0.4 ? '#FF9F1C' : '#00E5A0';

  return (
    <div style={styles.root}>
      <style>{CSS}</style>

      {/* ── HEADER ── */}
      <div style={styles.header}>
        <div>
          <div style={styles.headerLabel}>
            <span style={{ ...styles.dot, background: active.color, boxShadow: `0 0 8px ${active.color}` }} />
            GEO_INTEL // SECTOR_ALPHA
          </div>
          <div style={styles.tabRow}>
            {Object.keys(CITIES).map(cName => {
              const city = CITIES[cName];
              const isActive = cName === selectedCity;
              const isHov = cName === hoveredCity;
              return (
                <button
                  key={cName}
                  onClick={() => handleCitySelect(cName)}
                  onMouseEnter={() => setHoveredCity(cName)}
                  onMouseLeave={() => setHoveredCity(null)}
                  style={{
                    ...styles.tab,
                    background: isActive ? `${city.color}18` : isHov ? `${city.color}0a` : 'transparent',
                    border: isActive
                      ? `1px solid ${city.color}55`
                      : isHov ? `1px solid ${city.color}22` : '1px solid transparent',
                    color: isActive ? city.color : isHov ? `${city.color}cc` : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {cName.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
        <div style={styles.clockBlock}>
          <div style={{ color: 'rgba(255,255,255,0.2)', marginBottom: 3 }}>AMX_GEO_v3.1</div>
          <div style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.05em' }}>{timeStr}</div>
        </div>
      </div>

      {/* ── MAP ── */}
      <div style={styles.mapWrapper}>
        {/* Lat/lon grid labels */}
        <div style={styles.lonLabels}>
          {[0, 30, 60, 90, 120].map(lon => (
            <span key={lon} style={styles.gridLabel}>{lon}°E</span>
          ))}
        </div>

        <svg
          viewBox="0 0 1000 666"
          style={styles.svg}
          aria-label="One Health regional map"
        >
          <defs>
            <filter id="ohm-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="ohm-glow-sm" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="ohm-scan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="40%" stopColor="rgba(0,210,255,0.08)" />
              <stop offset="50%" stopColor="rgba(0,210,255,0.18)" />
              <stop offset="60%" stopColor="rgba(0,210,255,0.08)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="ohm-land" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(70,130,180,0.18)" />
              <stop offset="100%" stopColor="rgba(40,80,120,0.10)" />
            </linearGradient>
          </defs>

          {/* ── Background grid ── */}
          <g stroke="rgba(0,210,255,0.04)" strokeWidth="0.5">
            {/* vertical lon lines every 30° */}
            {[0, 250, 500, 750, 1000].map(x => (
              <line key={x} x1={x} y1={0} x2={x} y2={666} />
            ))}
            {/* horizontal lat lines every 20° */}
            {[0, 166, 333, 499, 666].map(y => (
              <line key={y} x1={0} y1={y} x2={1000} y2={y} />
            ))}
          </g>

          {/* Equator highlight */}
          <line
            x1={0} y1={toY(0)} x2={1000} y2={toY(0)}
            stroke="rgba(0,210,255,0.12)" strokeWidth="1"
            strokeDasharray="8 6"
          />
          <text
            x={8} y={toY(0) - 5}
            fill="rgba(0,210,255,0.3)"
            style={{ fontSize: 8, fontFamily: 'monospace', letterSpacing: '0.1em' }}
          >
            EQUATOR
          </text>

          {/* ── Landmasses ── */}
          <g fill="url(#ohm-land)" stroke="rgba(100,180,220,0.22)" strokeWidth="0.8" strokeLinejoin="round">
            <path d={AFRICA} />
            <path d={MADAGASCAR} />
            <path d={ARABIA} />
            <path d={INDIA} />
            <path d={SRI_LANKA} />
            <path d={INDOCHINA} />
            <path d={SUMATRA} />
            <path d={BORNEO} />
            <path d={JAVA} />
          </g>

          {/* ── Connection arcs ── */}
          <g fill="none" opacity="0.45">
            {/* Nairobi → Dhaka */}
            <path
              className="ohm-arc"
              d={`M ${CITIES.Nairobi.x},${CITIES.Nairobi.y}
                  Q ${(CITIES.Nairobi.x + CITIES.Dhaka.x) / 2},${Math.min(CITIES.Nairobi.y, CITIES.Dhaka.y) - 80}
                  ${CITIES.Dhaka.x},${CITIES.Dhaka.y}`}
              stroke={CITIES.Nairobi.color}
              strokeWidth="1"
              strokeDasharray="6 4"
            />
            {/* Dhaka → Singapore */}
            <path
              className="ohm-arc"
              d={`M ${CITIES.Dhaka.x},${CITIES.Dhaka.y}
                  Q ${(CITIES.Dhaka.x + CITIES.Singapore.x) / 2},${Math.min(CITIES.Dhaka.y, CITIES.Singapore.y) - 50}
                  ${CITIES.Singapore.x},${CITIES.Singapore.y}`}
              stroke={CITIES.Singapore.color}
              strokeWidth="1"
              strokeDasharray="6 4"
            />
          </g>

          {/* ── Scanline ── */}
          <rect
            x={0}
            y={scanY - 40}
            width={1000}
            height={80}
            fill="url(#ohm-scan)"
            style={{ pointerEvents: 'none' }}
          />

          {/* ── City markers & labels ── */}
          {Object.entries(CITIES).map(([name, c]) => {
            const isActive = name === selectedCity;
            const isHov = name === hoveredCity;
            const show = isActive || isHov;
            const flip = c.labelSide === 'left'; // label to the left of dot
            const labelX = flip ? c.x - 14 : c.x + 14;
            const labelAnchor = flip ? 'end' : 'start';
            const bgX = flip ? c.x - 130 : c.x + 10;

            return (
              <g
                key={name}
                style={{ cursor: 'pointer' }}
                onClick={() => handleCitySelect(name)}
                onMouseEnter={() => setHoveredCity(name)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                {/* Ping ring (active only) */}
                {isActive && (
                  <>
                    <circle cx={c.x} cy={c.y} r={18} fill="none" stroke={c.color} strokeWidth="1" className="ohm-ping" />
                    <circle cx={c.x} cy={c.y} r={10} fill="none" stroke={c.color} strokeWidth="0.5" opacity={0.4} className="ohm-ping" style={{ animationDelay: '0.5s' }} />
                  </>
                )}

                {/* Crosshair lines */}
                {show && (
                  <g stroke={c.color} strokeWidth="0.6" opacity={0.35}>
                    <line x1={c.x - 20} y1={c.y} x2={c.x - 6} y2={c.y} />
                    <line x1={c.x + 6} y1={c.y} x2={c.x + 20} y2={c.y} />
                    <line x1={c.x} y1={c.y - 20} x2={c.x} y2={c.y - 6} />
                    <line x1={c.x} y1={c.y + 6} x2={c.x} y2={c.y + 20} />
                  </g>
                )}

                {/* Core dot */}
                <circle
                  cx={c.x} cy={c.y}
                  r={isActive ? 5 : 4}
                  fill={c.color}
                  filter="url(#ohm-glow)"
                />
                <circle cx={c.x} cy={c.y} r={2} fill="#fff" opacity={0.9} />

                {/* Label card — always visible */}
                <rect
                  x={bgX} y={c.y - 28}
                  width={120} height={40}
                  rx={3}
                  fill="rgba(5,8,14,0.88)"
                  stroke={c.color}
                  strokeWidth={isActive ? 0.8 : 0.4}
                  strokeOpacity={isActive ? 0.7 : 0.3}
                />
                {/* Corner ticks */}
                <line x1={bgX} y1={c.y - 28} x2={bgX + 6} y2={c.y - 28} stroke={c.color} strokeWidth={1} opacity={0.6} />
                <line x1={bgX} y1={c.y - 28} x2={bgX} y2={c.y - 22} stroke={c.color} strokeWidth={1} opacity={0.6} />
                <line x1={bgX + 120} y1={c.y + 12} x2={bgX + 114} y2={c.y + 12} stroke={c.color} strokeWidth={1} opacity={0.6} />
                <line x1={bgX + 120} y1={c.y + 12} x2={bgX + 120} y2={c.y + 6} stroke={c.color} strokeWidth={1} opacity={0.6} />

                {/* City name */}
                <text
                  x={flip ? bgX + 110 : bgX + 10}
                  y={c.y - 9}
                  textAnchor={flip ? 'end' : 'start'}
                  fill={c.color}
                  filter="url(#ohm-glow-sm)"
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    fontFamily: '"Courier New", Courier, monospace',
                    letterSpacing: '0.08em',
                  }}
                >
                  {c.name}
                </text>

                {/* Coordinates */}
                <text
                  x={flip ? bgX + 110 : bgX + 10}
                  y={c.y + 7}
                  textAnchor={flip ? 'end' : 'start'}
                  fill="rgba(200,220,255,0.55)"
                  style={{
                    fontSize: 8.5,
                    fontFamily: '"Courier New", Courier, monospace',
                    letterSpacing: '0.04em',
                  }}
                >
                  {c.coords}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Lat label strip on right */}
        <div style={styles.latLabels}>
          {[40, 20, 0, -20, -40].map(lat => (
            <span key={lat} style={styles.gridLabel}>
              {lat >= 0 ? `${lat}°N` : `${Math.abs(lat)}°S`}
            </span>
          ))}
        </div>
      </div>

      {/* ── DATA PANEL ── */}
      <div style={styles.dataPanel}>
        {/* Zone + risk badge */}
        <div style={styles.panelHeader}>
          <span style={styles.zoneLabel}>{active.zone}</span>
          <span
            style={{
              ...styles.riskBadge,
              color: active.color,
              background: `${active.color}12`,
              border: `1px solid ${active.color}44`,
            }}
          >
            {active.riskLevel}
          </span>
        </div>

        {/* Stats grid */}
        <div style={styles.statsGrid}>
          {[
            { label: 'POPULATION', value: active.population },
            { label: 'AQI INDEX', value: active.aqi },
            { label: 'CLIMATE', value: active.climate },
            { label: 'VECTOR_IDX', value: active.vectorIdx },
          ].map(s => (
            <div key={s.label} style={styles.statCell}>
              <div style={styles.statLabel}>{s.label}</div>
              <div style={styles.statValue}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Outbreak risk bar */}
        <div style={styles.riskSection}>
          <div style={styles.riskRow}>
            <span style={styles.riskLabel}>OUTBREAK_RISK_THRESHOLD</span>
            <span style={{ ...styles.riskPct, color: active.color }}>{outbreakPct}%</span>
          </div>
          <div style={styles.riskTrack}>
            {/* Segment markers */}
            {[25, 50, 75].map(p => (
              <div
                key={p}
                style={{
                  position: 'absolute',
                  left: `${p}%`,
                  top: 0, bottom: 0,
                  width: 1,
                  background: 'rgba(255,255,255,0.15)',
                  zIndex: 2,
                }}
              />
            ))}
            <div
              style={{
                height: '100%',
                width: `${outbreakPct}%`,
                background: `linear-gradient(90deg, ${riskGradient}88, ${riskGradient})`,
                boxShadow: `0 0 12px ${riskGradient}55`,
                borderRadius: 3,
                transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
                position: 'relative',
                zIndex: 1,
              }}
            />
          </div>
          <div style={styles.riskTicks}>
            {['LOW', 'MODERATE', 'HIGH', 'CRITICAL'].map(t => (
              <span key={t} style={styles.riskTick}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={styles.footer}>
        <div style={styles.footerStatus}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00E5A0', boxShadow: '0 0 6px #00E5A0', animation: 'ohm-blink 2s ease-in-out infinite' }} />
          UPLINK_STABLE // HCS_MASTER
        </div>
        <div style={styles.footerProto}>PROTOCOL_AMX_V3_REGIONAL</div>
      </div>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(160deg, #07090f 0%, #040608 100%)',
    border: '1px solid rgba(0,210,255,0.07)',
    overflow: 'hidden',
    position: 'relative',
    fontFamily: '"Courier New", Courier, monospace',
  },
  header: {
    padding: '14px 18px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  headerLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.28)',
    letterSpacing: '0.2em',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 7,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    display: 'inline-block',
  },
  tabRow: {
    display: 'flex',
    gap: 4,
  },
  tab: {
    padding: '7px 16px',
    borderRadius: 3,
    cursor: 'pointer',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    transition: 'all 0.18s ease',
    outline: 'none',
  },
  clockBlock: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'right',
    lineHeight: 1.6,
    letterSpacing: '0.05em',
  },
  mapWrapper: {
    position: 'relative',
    width: '100%',
    flexShrink: 0,
    background: '#030508',
    borderTop: '1px solid rgba(0,210,255,0.06)',
    borderBottom: '1px solid rgba(0,210,255,0.06)',
  },
  svg: {
    width: '100%',
    height: 'auto',
    display: 'block',
    maxHeight: 290,
  },
  lonLabels: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 28,
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: 4,
    pointerEvents: 'none',
  },
  latLabels: {
    position: 'absolute',
    right: 4,
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 4,
    pointerEvents: 'none',
  },
  gridLabel: {
    fontSize: 7,
    fontFamily: '"Courier New", Courier, monospace',
    color: 'rgba(0,210,255,0.2)',
    letterSpacing: '0.05em',
  },
  dataPanel: {
    padding: '16px 18px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  zoneLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.28)',
    letterSpacing: '0.15em',
  },
  riskBadge: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    padding: '4px 10px',
    borderRadius: 2,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px 28px',
  },
  statCell: { },
  statLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.22)',
    letterSpacing: '0.1em',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 17,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.88)',
    letterSpacing: '0.03em',
  },
  riskSection: {
    marginTop: 4,
  },
  riskRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 7,
  },
  riskLabel: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: '0.1em',
  },
  riskPct: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: '-0.01em',
    lineHeight: 1,
  },
  riskTrack: {
    height: 7,
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  riskTicks: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  riskTick: {
    fontSize: 7,
    color: 'rgba(255,255,255,0.15)',
    letterSpacing: '0.08em',
  },
  footer: {
    padding: '9px 18px',
    background: 'rgba(0,0,0,0.25)',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 8,
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: '0.1em',
  },
  footerProto: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.1)',
    letterSpacing: '0.08em',
  },
};

// ─── Keyframe CSS ──────────────────────────────────────────────────────────────
const CSS = `
  @keyframes ohm-ping {
    0%   { transform: scale(1); opacity: 0.7; }
    100% { transform: scale(2.8); opacity: 0; }
  }
  @keyframes ohm-arc {
    from { stroke-dashoffset: 200; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes ohm-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.3; }
  }
  .ohm-ping {
    animation: ohm-ping 2.2s cubic-bezier(0,0,0.2,1) infinite;
    transform-origin: center;
    transform-box: fill-box;
  }
  .ohm-arc {
    animation: ohm-arc 4s linear infinite;
    stroke-dasharray: 200;
  }
`;

export default OneHealthMap;
