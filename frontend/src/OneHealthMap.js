import React, { useState, useEffect, useRef } from 'react';

// ─── Projection ───────────────────────────────────────────────────────────────
// viewport: lon 20°E – 115°E → x 0–1000  |  lat 35°N – 10°S → y 0–666
const mx = (lon) => ((lon - 20) / 95) * 1000;
const my = (lat) => ((35 - lat) / 45) * 666;
const mkPath = (pts) =>
  pts.map(([lo, la], i) => `${i ? 'L' : 'M'}${mx(lo).toFixed(1)},${my(la).toFixed(1)}`).join('') + 'Z';

// ─── Landmass polygons ────────────────────────────────────────────────────────
const LANDS = [
  // Eastern Africa + Horn of Somalia
  mkPath([
    [20, 35], [33, 35], [32, 29], [37, 27], [38, 20], [40, 16], [42, 12],
    [50, 12], [51, 11],
    [46, 5], [43, 0], [41, -4], [40, -8], [38, -10],
    [20, -10],
  ]),
  // Arabian Peninsula
  mkPath([
    [35, 33], [43, 33], [47, 31], [48, 30],
    [51, 27], [56, 26], [58, 24], [59, 22],
    [55, 17], [50, 12],
    [43, 13], [40, 18], [38, 22], [37, 25], [35, 29],
  ]),
  // Iranian / Afghan / Pakistani plateau
  mkPath([
    [43, 33], [63, 35], [100, 35], [97, 28],
    [85, 28], [77, 31], [68, 28], [62, 25],
    [58, 24], [56, 26], [51, 27], [48, 30], [47, 31], [43, 33],
  ]),
  // Indian Subcontinent
  mkPath([
    [62, 25], [68, 23], [72, 22], [73, 19], [74, 14],
    [76, 10], [77, 8],
    [80, 9], [80, 13], [83, 20], [87, 20],
    [88, 22], [91, 22], [93, 24],
    [97, 27], [85, 28], [77, 31], [68, 28], [62, 25],
  ]),
  // Sri Lanka
  mkPath([[80, 10], [81, 10], [82, 9], [82, 7], [81, 6], [80, 7], [80, 9]]),
  // Indochina + Malay Peninsula
  mkPath([
    [93, 24], [95, 22], [98, 17], [98, 14], [99, 8],
    [100, 4], [101, 3], [104, 1],
    [104, 4], [103, 7], [104, 10], [105, 11],
    [107, 12], [109, 16], [109, 18], [108, 20], [107, 23],
    [115, 25], [115, 35], [100, 35],
    [97, 28], [93, 24],
  ]),
  // Sumatra
  mkPath([
    [95, 5], [97, 4], [100, 2], [103, 1], [106, 0],
    [106, -2], [104, -3], [100, -2], [97, 0], [96, 2], [95, 4],
  ]),
  // Borneo (partial)
  mkPath([[108, 5], [110, 4], [113, 4], [115, 5], [115, -1], [110, -2], [108, 0], [108, 4]]),
  // Java (near bottom edge)
  mkPath([[106, -6], [108, -7], [111, -8], [111, -9], [108, -9], [106, -7]]),
  // Madagascar (partial)
  mkPath([[44, -12], [46, -13], [48, -18], [48, -22], [44, -25], [43, -20], [44, -15]]),
];

// ─── City data ────────────────────────────────────────────────────────────────
const CITIES = {
  Dhaka: {
    lon: 90.41, lat: 23.81, color: '#FF4040',
    name: 'DHAKA', coords: '23.81°N  90.41°E',
    population: '21.0M', aqi: 162, climate: 'Monsoon',
    riskLevel: 'CRITICAL', baseOutbreak: 0.85,
    zone: 'SOUTH-ASIA', vectorIdx: 94, labelSide: 'right',
  },
  Nairobi: {
    lon: 36.82, lat: -1.29, color: '#FF9F1C',
    name: 'NAIROBI', coords: '1.29°S  36.82°E',
    population: '4.4M', aqi: 45, climate: 'Highland',
    riskLevel: 'VECTOR', baseOutbreak: 0.45,
    zone: 'EAST-AFRICA', vectorIdx: 62, labelSide: 'right',
  },
  Singapore: {
    lon: 103.82, lat: 1.35, color: '#00E5A0',
    name: 'SINGAPORE', coords: '1.35°N  103.82°E',
    population: '5.9M', aqi: 25, climate: 'Tropical',
    riskLevel: 'NOMINAL', baseOutbreak: 0.12,
    zone: 'SE-ASIA', vectorIdx: 18, labelSide: 'left',
  },
};
Object.values(CITIES).forEach(c => { c.x = mx(c.lon); c.y = my(c.lat); });

const LW = 180; // further enlarged label card width
const LH = 60;  // further enlarged label card height

// ─── Component ────────────────────────────────────────────────────────────────
const OneHealthMap = ({ currentCity, outbreakRisk, setSelectedCityExternal }) => {
  const [selected, setSelected] = useState(currentCity || 'Dhaka');
  const [hovered,  setHovered]  = useState(null);
  const [time,     setTime]     = useState('');
  const [scanY,    setScanY]    = useState(0);
  const rafRef = useRef(null);
  const t0Ref  = useRef(Date.now());

  useEffect(() => { if (currentCity) setSelected(currentCity); }, [currentCity]);

  useEffect(() => {
    const tick = () => setTime(new Date().toISOString().slice(11, 19) + ' UTC');
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const loop = () => {
      setScanY(((Date.now() - t0Ref.current) % 5000) / 5000 * 666);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const select = (c) => { setSelected(c); setSelectedCityExternal?.(c); };
  const active  = CITIES[selected] || CITIES.Dhaka;
  const outbreak = (selected === currentCity && outbreakRisk != null)
    ? outbreakRisk : active.baseOutbreak;
  const pct      = (outbreak * 100).toFixed(1);
  const barColor = outbreak > 0.7 ? '#FF4040' : outbreak > 0.4 ? '#FF9F1C' : '#00E5A0';

  return (
    <div style={S.root}>
      <style>{`
        @keyframes ohPing {
          0%   { transform:scale(1);   opacity:.7; }
          100% { transform:scale(2.8); opacity:0;  }
        }
        @keyframes ohArc  { from{stroke-dashoffset:320} to{stroke-dashoffset:0} }
        @keyframes ohBlink{ 0%,100%{opacity:1} 50%{opacity:.3} }
        .oh-ping  { animation:ohPing 2.2s cubic-bezier(0,0,.2,1) infinite; transform-origin:center; transform-box:fill-box; }
        .oh-arc   { stroke-dasharray:320; animation:ohArc 5s linear infinite; }
        .oh-arc2  { stroke-dasharray:320; animation:ohArc 5s linear infinite; animation-delay:1.2s; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={S.header}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={S.sectorLabel}>
            <span style={{ ...S.dot, background: active.color, boxShadow: `0 0 8px ${active.color}` }} />
            GEO_INTEL // SECTOR_ALPHA
          </div>
          <div style={S.tabRow}>
            {Object.keys(CITIES).map(k => {
              const c  = CITIES[k];
              const on = k === selected;
              const ho = k === hovered;
              return (
                <button
                  key={k}
                  onClick={() => select(k)}
                  onMouseEnter={() => setHovered(k)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    ...S.tab,
                    background: on ? `${c.color}15` : ho ? `${c.color}08` : 'transparent',
                    border: `1px solid ${on ? c.color + '55' : ho ? c.color + '20' : 'transparent'}`,
                    color: on ? c.color : ho ? `${c.color}bb` : 'rgba(255,255,255,0.33)',
                  }}
                >
                  {k.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Clock — fixed width, never wraps */}
        <div style={S.clock}>
          <div style={{ color: 'rgba(255,255,255,0.22)', marginBottom: 2, fontSize: 10, fontWeight: 700 }}>UTC</div>
          <div style={{ color: active.color, fontSize: 13, fontWeight: 700, filter: 'url(#ohGlowSm)' }}>{time}</div>
        </div>
      </div>

      {/* ── MAP ── */}
      <div style={S.mapBox}>
        <svg viewBox="0 0 1000 666" style={S.svg}>
          <defs>
            <filter id="ohGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="ohGlowSm" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="ohScan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="transparent" />
              <stop offset="45%"  stopColor="rgba(0,200,255,0.06)" />
              <stop offset="50%"  stopColor="rgba(0,200,255,0.15)" />
              <stop offset="55%"  stopColor="rgba(0,200,255,0.06)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="ohLand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="rgba(55,105,155,0.34)" />
              <stop offset="100%" stopColor="rgba(28,65,100,0.20)" />
            </linearGradient>
          </defs>

          {/* Grid */}
          <g stroke="rgba(0,200,255,0.04)" strokeWidth="0.5">
            {[200,400,600,800].map(x => <line key={x} x1={x} y1={0} x2={x} y2={666} />)}
            {[166,333,499].map(y => <line key={y} x1={0} y1={y} x2={1000} y2={y} />)}
          </g>

          {/* Equator */}
          <line x1={0} y1={my(0)} x2={1000} y2={my(0)}
            stroke="rgba(0,200,255,0.13)" strokeWidth={0.8} strokeDasharray="8 5" />
          <text x={8} y={my(0) - 5} fill="rgba(0,200,255,0.3)"
            fontSize={7.5} fontFamily="monospace" letterSpacing="0.1em">EQUATOR</text>

          {/* Tropic of Cancer */}
          <line x1={0} y1={my(23.5)} x2={1000} y2={my(23.5)}
            stroke="rgba(255,190,0,0.07)" strokeWidth={0.5} strokeDasharray="3 9" />

          {/* Landmasses */}
          <g fill="url(#ohLand)" stroke="rgba(90,160,220,0.3)" strokeWidth={0.8} strokeLinejoin="round">
            {LANDS.map((d, i) => <path key={i} d={d} />)}
          </g>

          {/* Arcs */}
          <g fill="none">
            <path className="oh-arc"
              d={`M${CITIES.Nairobi.x},${CITIES.Nairobi.y} Q${(CITIES.Nairobi.x + CITIES.Dhaka.x) / 2},${Math.min(CITIES.Nairobi.y, CITIES.Dhaka.y) - 110} ${CITIES.Dhaka.x},${CITIES.Dhaka.y}`}
              stroke={CITIES.Nairobi.color} strokeWidth={0.9} opacity={0.45} />
            <path className="oh-arc2"
              d={`M${CITIES.Dhaka.x},${CITIES.Dhaka.y} Q${(CITIES.Dhaka.x + CITIES.Singapore.x) / 2},${Math.min(CITIES.Dhaka.y, CITIES.Singapore.y) - 90} ${CITIES.Singapore.x},${CITIES.Singapore.y}`}
              stroke={CITIES.Singapore.color} strokeWidth={0.9} opacity={0.45} />
          </g>

          {/* Scanline */}
          <rect x={0} y={scanY - 50} width={1000} height={100}
            fill="url(#ohScan)" style={{ pointerEvents: 'none' }} />

          {/* ── City markers ── */}
          {Object.entries(CITIES).map(([name, c]) => {
            const isOn = name === selected;
            const flip = c.labelSide === 'left';

            // Keep label card strictly inside the SVG viewBox
            const rawLx = flip ? c.x - 14 - LW : c.x + 14;
            const lx    = Math.min(Math.max(rawLx, 3), 1000 - LW - 3);
            const rawLy = c.y - LH / 2 - 4;
            const ly    = Math.min(Math.max(rawLy, 3), 666 - LH - 3);

            return (
              <g key={name} style={{ cursor: 'pointer' }}
                onClick={() => select(name)}
                onMouseEnter={() => setHovered(name)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Ping rings */}
                {isOn && <>
                  <circle cx={c.x} cy={c.y} r={36} fill="none"
                    stroke={c.color} strokeWidth={1.8} className="oh-ping" />
                  <circle cx={c.x} cy={c.y} r={20} fill="none"
                    stroke={c.color} strokeWidth={1} opacity={0.4} className="oh-ping"
                    style={{ animationDelay: '.65s' }} />
                </>}

                {/* Crosshair */}
                <g stroke={c.color} strokeWidth={1.2} opacity={isOn ? 0.8 : 0.4}>
                  <line x1={c.x - 36} y1={c.y} x2={c.x - 14} y2={c.y} />
                  <line x1={c.x + 14}  y1={c.y} x2={c.x + 36} y2={c.y} />
                  <line x1={c.x} y1={c.y - 36} x2={c.x} y2={c.y - 14} />
                  <line x1={c.x} y1={c.y + 14}  x2={c.x} y2={c.y + 36} />
                </g>

                {/* Core dot */}
                <circle cx={c.x} cy={c.y} r={isOn ? 10 : 8}
                  fill={c.color} filter="url(#ohGlow)" />
                <circle cx={c.x} cy={c.y} r={isOn ? 4.5 : 3.5}
                  fill="#ffffff" opacity={0.95} />

                {/* Label card — drop shadow */}
                <rect x={lx + 1} y={ly + 1} width={LW} height={LH} rx={3}
                  fill="rgba(0,0,0,0.5)" />
                {/* Card body */}
                <rect x={lx} y={ly} width={LW} height={LH} rx={3}
                  fill="rgba(4,7,15,0.95)"
                  stroke={c.color}
                  strokeWidth={isOn ? 1.5 : 0.8}
                  strokeOpacity={isOn ? 1 : 0.5} />
                {/* Corner accents */}
                <path d={`M${lx},${ly + 14}V${ly}H${lx + 14}`}
                  fill="none" stroke={c.color} strokeWidth={2} opacity={0.8} />
                <path d={`M${lx + LW},${ly + LH - 14}V${ly + LH}H${lx + LW - 14}`}
                  fill="none" stroke={c.color} strokeWidth={2} opacity={0.8} />

                {/* City name */}
                <text
                  x={lx + (flip ? LW - 14 : 14)}
                  y={ly + 26}
                  textAnchor={flip ? 'end' : 'start'}
                  fill={c.color}
                  filter="url(#ohGlowSm)"
                  fontSize={22} fontWeight="950"
                  fontFamily='"Courier New", Courier, monospace'
                  letterSpacing="0.08em"
                >
                  {c.name}
                </text>

                {/* Coordinates */}
                <text
                  x={lx + (flip ? LW - 12 : 12)}
                  y={ly + 40}
                  textAnchor={flip ? 'end' : 'start'}
                  fill="rgba(170,205,255,0.7)"
                  fontSize={11}
                  fontFamily='"Courier New", Courier, monospace'
                  letterSpacing="0.04em"
                >
                  {c.coords}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Axis tick labels */}
        <div style={S.lonLabels}>
          {['20°E','39°E','58°E','77°E','96°E','115°E'].map(l => (
            <span key={l} style={S.axisLbl}>{l}</span>
          ))}
        </div>
        <div style={S.latLabels}>
          {['35°N','20°N','5°N','10°S'].map(l => (
            <span key={l} style={S.axisLbl}>{l}</span>
          ))}
        </div>
      </div>

      {/* ── DATA PANEL ── */}
      <div style={S.panel}>
        <div style={S.panelHead}>
          <span style={S.zone}>{active.zone}</span>
          <span style={{ ...S.badge, color: active.color, background: `${active.color}12`, border: `1px solid ${active.color}44` }}>
            {active.riskLevel}
          </span>
        </div>

        <div style={S.statsGrid}>
          {[['POPULATION',active.population],['AQI INDEX',active.aqi],['CLIMATE',active.climate],['VECTOR_IDX',active.vectorIdx]].map(([l,v]) => (
            <div key={l}>
              <div style={S.statLbl}>{l}</div>
              <div style={S.statVal}>{v}</div>
            </div>
          ))}
        </div>

        <div>
          <div style={S.riskRow}>
            <span style={{ fontSize:8, color:'rgba(255,255,255,0.25)', letterSpacing:'0.08em' }}>
              OUTBREAK_RISK
            </span>
            <span style={{ fontSize:22, fontWeight:800, color:active.color, lineHeight:1 }}>
              {pct}%
            </span>
          </div>
          <div style={S.track}>
            {[25,50,75].map(p => (
              <div key={p} style={{ position:'absolute', left:`${p}%`, top:0, bottom:0, width:1, background:'rgba(255,255,255,0.13)', zIndex:2 }}/>
            ))}
            <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${barColor}66,${barColor})`, boxShadow:`0 0 12px ${barColor}44`, borderRadius:3, transition:'width 1.2s cubic-bezier(.4,0,.2,1)', position:'relative', zIndex:1 }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
            {['LOW','MOD','HIGH','CRIT'].map(t => (
              <span key={t} style={{ fontSize:7, color:'rgba(255,255,255,0.15)', letterSpacing:'0.07em' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={S.footer}>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:8, color:'rgba(255,255,255,0.2)', letterSpacing:'0.1em' }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:'#00E5A0', boxShadow:'0 0 5px #00E5A0', animation:'ohBlink 2s ease-in-out infinite' }}/>
          UPLINK_STABLE // HCS_MASTER
        </div>
        <div style={{ fontSize:8, color:'rgba(255,255,255,0.1)', letterSpacing:'0.07em' }}>PROTOCOL_AMX_V3</div>
      </div>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  root: {
    display:'flex', flexDirection:'column', height:'100%',
    background:'linear-gradient(160deg,#07090f 0%,#040608 100%)',
    border:'1px solid rgba(0,200,255,0.07)',
    overflow:'hidden',
    fontFamily:'"Courier New", Courier, monospace',
  },
  header: {
    padding:'12px 16px',
    display:'flex', justifyContent:'space-between', alignItems:'flex-start',
    borderBottom:'1px solid rgba(255,255,255,0.04)',
    gap:10,
  },
  sectorLabel: {
    fontSize:9, color:'rgba(255,255,255,0.27)', letterSpacing:'0.2em',
    marginBottom:8, display:'flex', alignItems:'center', gap:6,
  },
  dot: { width:6, height:6, borderRadius:'50%', flexShrink:0 },
  tabRow: { display:'flex', gap:8, flexWrap:'nowrap' },
  tab: {
    padding:'6px 12px', borderRadius:3, cursor:'pointer',
    fontFamily:'"Courier New", Courier, monospace',
    fontSize:10, fontWeight:700, letterSpacing:'0.1em',
    transition:'all .15s ease', whiteSpace:'nowrap', outline:'none',
  },
  clock: {
    fontSize:8, textAlign:'right', flexShrink:0,
    lineHeight:1.7, whiteSpace:'nowrap', color:'rgba(255,255,255,0.2)',
    letterSpacing:'0.04em',
  },
  mapBox: {
    position:'relative', background:'#030508',
    borderBottom:'1px solid rgba(0,200,255,0.06)',
  },
  svg: { width:'100%', height:'auto', display:'block', maxHeight:290 },
  lonLabels: {
    position:'absolute', bottom:20, left:'1%', right:'3%',
    display:'flex', justifyContent:'space-between', pointerEvents:'none',
  },
  latLabels: {
    position:'absolute', right:4, top:'2%', bottom:'5%',
    display:'flex', flexDirection:'column', justifyContent:'space-between',
    pointerEvents:'none',
  },
  axisLbl: {
    fontSize:7, color:'rgba(0,200,255,0.22)',
    fontFamily:'"Courier New", monospace', letterSpacing:'0.03em',
  },
  panel: {
    padding:'14px 16px', flex:1,
    display:'flex', flexDirection:'column', gap:12, minHeight:0,
  },
  panelHead: {
    display:'flex', justifyContent:'space-between', alignItems:'center',
    paddingBottom:10, borderBottom:'1px solid rgba(255,255,255,0.05)',
  },
  zone:  { fontSize:9, color:'rgba(255,255,255,0.27)', letterSpacing:'0.15em' },
  badge: { fontSize:10, fontWeight:700, letterSpacing:'0.12em', padding:'3px 9px', borderRadius:2 },
  statsGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px 24px' },
  statLbl: { fontSize:8, color:'rgba(255,255,255,0.22)', letterSpacing:'0.1em', marginBottom:2 },
  statVal: { fontSize:16, fontWeight:700, color:'rgba(255,255,255,0.88)' },
  riskRow: { display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:6 },
  track: {
    height:7, background:'rgba(255,255,255,0.04)', borderRadius:3,
    overflow:'hidden', position:'relative', border:'1px solid rgba(255,255,255,0.06)',
  },
  footer: {
    padding:'8px 16px', background:'rgba(0,0,0,0.2)',
    borderTop:'1px solid rgba(255,255,255,0.03)',
    display:'flex', justifyContent:'space-between', alignItems:'center',
  },
};

export default OneHealthMap;
