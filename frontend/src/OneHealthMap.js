import React, { useState, useEffect, useRef } from 'react';
import createGlobe from 'cobe';

const OneHealthMap = ({ currentCity, outbreakRisk, setSelectedCityExternal }) => {
  const [selectedCity, setSelectedCity] = useState(currentCity || 'Dhaka');
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const globeRef = useRef(null);

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
    let phi = 0;
    let width = 0;

    const initializeGlobe = (w) => {
      if (globeRef.current) globeRef.current.destroy();
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      globeRef.current = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: w * 2,
        height: w * 2,
        phi: 0,
        theta: 0.3,
        dark: 1,
        diffuse: 1.4,
        mapSamples: 16000,
        mapBrightness: 8,
        baseColor: [0.15, 0.15, 0.15],
        markerColor: [0.2, 0.85, 0.9],
        glowColor: [0.08, 0.08, 0.08],
        markers: [
          { location: [23.81, 90.41], size: 0.06 },   // Dhaka
          { location: [-1.29, 36.82], size: 0.06 },   // Nairobi
          { location: [1.35, 103.82], size: 0.06 }    // Singapore
        ],
        onRender: (state) => {
          state.phi = phi;
          phi += 0.003;
        },
      });

      // Ensure canvas is visible immediately
      canvas.style.opacity = '1';
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const newWidth = entry.contentRect.width;
        if (newWidth > 0 && newWidth !== width) {
          width = newWidth;
          initializeGlobe(newWidth);
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (globeRef.current) globeRef.current.destroy();
      resizeObserver.disconnect();
    };
  }, []);

  const handleCitySelect = (c) => {
    setSelectedCity(c);
    if (setSelectedCityExternal) setSelectedCityExternal(c);
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

      {/* 3D Cobe Globe Visual Area */}
      <div 
        ref={containerRef}
        style={{ 
          width: '220px', 
          height: '220px', 
          margin: '10px auto',
          position: 'relative'
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            opacity: 0,
            transition: 'opacity 1s ease',
          }}
        />
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
