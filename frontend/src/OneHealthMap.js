import React, { useState, useEffect, useRef } from 'react';
import createGlobe from 'cobe';

const OneHealthMap = ({ currentCity, outbreakRisk, setSelectedCityExternal }) => {
  const [selectedCity, setSelectedCity] = useState(currentCity || 'Dhaka');
  const canvasRef = useRef(null);
  const globeRef = useRef(null);
  const phiRef = useRef(0);

  useEffect(() => {
    if (currentCity) setSelectedCity(currentCity);
  }, [currentCity]);

  const cities = {
    'Dhaka': {
      color: '#FF4444',
      name: 'DHAKA',
      population: '21.0M',
      aqi: 162,
      climate: 'Monsoon',
      riskLevel: 'HIGH',
      baseOutbreak: 0.85,
    },
    'Nairobi': {
      color: '#FF8C00',
      name: 'NAIROBI',
      population: '4.4M',
      aqi: 45,
      climate: 'Highland',
      riskLevel: 'MODERATE',
      baseOutbreak: 0.45,
    },
    'Singapore': {
      color: '#AAFF00',
      name: 'SINGAPORE',
      population: '5.9M',
      aqi: 25,
      climate: 'Tropical',
      riskLevel: 'LOW',
      baseOutbreak: 0.12,
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Destroy previous globe instance
    if (globeRef.current) {
      globeRef.current.destroy();
      globeRef.current = null;
    }

    const SIZE = 440; // 220px container * devicePixelRatio 2

    // Set actual canvas attributes — cobe requires these
    canvas.width = SIZE;
    canvas.height = SIZE;
    canvas.style.opacity = '1';

    globeRef.current = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: SIZE,
      height: SIZE,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.4,
      mapSamples: 16000,
      mapBrightness: 8,
      baseColor: [0.15, 0.15, 0.15],
      markerColor: [0.2, 0.85, 0.9],
      glowColor: [0.1, 0.1, 0.1],
      markers: [
        { location: [23.81, 90.41], size: 0.07 },
        { location: [-1.29, 36.82], size: 0.07 },
        { location: [1.35, 103.82], size: 0.07 },
      ],
      onRender: (state) => {
        state.phi = phiRef.current;
        phiRef.current += 0.003;
      },
    });

    return () => {
      if (globeRef.current) {
        globeRef.current.destroy();
        globeRef.current = null;
      }
    };
  }, []);

  const handleCitySelect = (c) => {
    setSelectedCity(c);
    if (setSelectedCityExternal) setSelectedCityExternal(c);
  };

  const activeData = cities[selectedCity] || cities['Dhaka'];
  const displayOutbreak =
    selectedCity === currentCity && outbreakRisk !== null
      ? outbreakRisk
      : activeData.baseOutbreak;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-surface)' }}>

      {/* Header + Tabs */}
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
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    paddingBottom: 8,
                    color: isActive ? cityColor : 'var(--text-secondary)',
                    borderBottom: isActive ? `1px solid ${cityColor}` : '1px solid transparent',
                    outline: 'none',
                    transition: 'color 0.2s',
                  }}
                >
                  {cities[city].name}
                </button>
                {idx < arr.length - 1 && (
                  <span style={{ color: 'rgba(255,255,255,0.1)', margin: '0 12px', fontSize: 9 }}>|</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Globe */}
      <div style={{ width: 220, height: 220, margin: '16px auto', position: 'relative', flexShrink: 0 }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            display: 'block',
          }}
        />
      </div>

      {/* Data Table */}
      <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column' }}>
        {[
          { label: 'POPULATION', value: activeData.population, color: null },
          { label: 'AQI', value: activeData.aqi, color: activeData.color },
          { label: 'CLIMATE', value: activeData.climate, color: null },
          { label: 'RISK_LEVEL', value: activeData.riskLevel, color: null },
          { label: 'OUTBREAK_%', value: `${(displayOutbreak * 100).toFixed(1)}%`, color: activeData.color },
        ].map((row, i, arr) => (
          <div
            key={row.label}
            style={{
              borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px 0',
            }}
          >
            <span className="dense-label">{row.label}</span>
            <span className="dense-val" style={row.color ? { color: row.color } : {}}>{row.value}</span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default OneHealthMap;
