import React, { useState, useEffect, useRef } from 'react';
import createGlobe from 'cobe';

const OneHealthMap = ({ currentCity, outbreakRisk, setSelectedCityExternal }) => {
  const [selectedCity, setSelectedCity] = useState(currentCity || 'Dhaka');
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const pointerInteracting = useRef(null);
  const pointerRelativePos = useRef(0);
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
    let phi = 0;
    let width = 0;

    const initializeGlobe = (w) => {
      if (globeInstanceRef.current) globeInstanceRef.current.destroy();
      
      globeInstanceRef.current = createGlobe(canvasRef.current, {
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
          { location: [23.81, 90.41], size: 0.05 },
          { location: [-1.29, 36.82], size: 0.05 },
          { location: [1.35, 103.82], size: 0.05 }
        ],
        onRender: (state) => {
          // Manual interaction offset
          if (!pointerInteracting.current) {
            phi += 0.003;
          }
          state.phi = phi + phiRef.current;

          // Pulse effect fallback if needed, but keeping baseline config first
          const pulse = Math.sin(Date.now() / 500) * 0.01;
          state.markers.forEach(m => {
            m.size = 0.05 + pulse;
          });
        },
      });

      // Canvas Opacity Fallback: Ensure visibility immediately
      if (canvasRef.current) {
        canvasRef.current.style.opacity = '1';
      }
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
      if (globeInstanceRef.current) {
        globeInstanceRef.current.destroy();
        globeInstanceRef.current = null;
      }
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
          position: 'relative', 
          cursor: 'grab' 
        }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerRelativePos.current;
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerRelativePos.current = delta;
            phiRef.current = delta / 200;
          }
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
