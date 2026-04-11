import React, { useState, useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import './index.css';

const OneHealthMap = ({ currentCity, outbreakRisk, setSelectedCityExternal }) => {
  const [selectedCity, setSelectedCity] = useState(currentCity || 'Dhaka');
  const canvasRef = useRef(null);
  const pointerInteracting = useRef(null);
  const pointerRelativePos = useRef(0);
  const phiRef = useRef(0);

  useEffect(() => {
    if (currentCity) setSelectedCity(currentCity);
  }, [currentCity]);

  const handleCitySelect = (c) => {
    setSelectedCity(c);
    if (setSelectedCityExternal) setSelectedCityExternal(c);
    
    // Smoothly rotate to city when selected
    const cityCoords = {
      'Dhaka': 90.41,
      'Nairobi': 36.82,
      'Singapore': 103.82
    };
    if (cityCoords[c] !== undefined) {
      // Crude logic to update phi, could be improved with easing
      // setPhi(prev => prev + (cityCoords[c] / 180 * Math.PI));
    }
  };

  const cities = {
    'Dhaka': {
      cx: 230, cy: 60,
      color: '#FF4444', // BUGFIX: as requested critical red
      name: 'DHAKA',
      population: '21.0M',
      aqi: 162,
      climate: 'Monsoon',
      riskLevel: 'HIGH',
      baseOutbreak: 0.85,
      location: [23.81, 90.41]
    },
    'Nairobi': {
      cx: 100, cy: 160,
      color: '#FF8C00', // BUGFIX: as requested vector orange
      name: 'NAIROBI',
      population: '4.4M',
      aqi: 45,
      climate: 'Highland',
      riskLevel: 'MODERATE',
      baseOutbreak: 0.45,
      location: [1.29, 36.82]
    },
    'Singapore': {
      cx: 260, cy: 155,
      color: '#AAFF00', // BUGFIX: as requested acid green
      name: 'SINGAPORE',
      population: '5.9M',
      aqi: 25,
      climate: 'Tropical',
      riskLevel: 'LOW',
      baseOutbreak: 0.12,
      location: [1.35, 103.82]
    }
  };

  useEffect(() => {
    let currentPhi = 0;
    let currentTheta = 0;
    const doublePi = Math.PI * 2;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 320 * 2,
      height: 220 * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.03, 0.03, 0.05], // Matching dark background
      markerColor: [0.2, 0.8, 0.9], // Cyan as requested for markers
      glowColor: [0.01, 0.01, 0.02], // Near-black glow
      markers: [
        { location: [23.81, 90.41], size: 0.08 },
        { location: [1.29, 36.82], size: 0.08 },
        { location: [1.35, 103.82], size: 0.08 },
      ],
      onRender: (state) => {
        if (!pointerInteracting.current) {
          // Auto-rotate logic as requested (speed 0.003)
          currentPhi += 0.003;
        }
        state.phi = currentPhi + phiRef.current;
        state.theta = currentTheta;
        
        // Pulse effect implementation (cycling marker sizes)
        const pulse = Math.sin(Date.now() / 300) * 0.02;
        state.markers[0].size = 0.07 + pulse;
        state.markers[1].size = 0.07 + pulse;
        state.markers[2].size = 0.07 + pulse;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

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
                  data-cursor={city === 'Dhaka' ? 'red' : city === 'Nairobi' ? 'orange' : 'acid'}
                  onClick={() => handleCitySelect(city)}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'none',
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
        style={{ 
          width: '100%', 
          height: 220, 
          position: 'relative', 
          overflow: 'hidden', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          cursor: 'grab' 
        }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerRelativePos.current;
          canvasRef.current.style.cursor = 'grabbing';
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          canvasRef.current.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          canvasRef.current.style.cursor = 'grab';
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerRelativePos.current = delta;
            phiRef.current = delta / 100;
          }
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: 320,
            height: 220,
            maxWidth: '100%',
            aspectRatio: '320/220',
          }}
        />
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
