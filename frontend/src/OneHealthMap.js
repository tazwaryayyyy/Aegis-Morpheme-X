/**
 * AMX Protocol - One Health Map Visualization
 * Geographic intelligence dashboard showing city-specific outbreak risks
 */

import React, { useState, useEffect, useRef } from 'react';

const OneHealthMap = ({ currentCity, cityConfig, outbreakRisk }) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedCity, setSelectedCity] = useState(currentCity);

  // City coordinates and data
  const cities = {
    'Dhaka': {
      lat: 23.8103,
      lng: 90.4125,
      name: 'Dhaka, Bangladesh',
      population: '21M',
      aqi: 162,
      climate: 'Monsoon',
      risk: 'HIGH',
      color: '#ff4d6d',
      description: 'High environmental stress, urgent healthcare needs'
    },
    'Singapore': {
      lat: 1.3521,
      lng: 103.8198,
      name: 'Singapore',
      population: '5.9M',
      aqi: 25,
      climate: 'Tropical',
      risk: 'LOW',
      color: '#00e5ff',
      description: 'Advanced healthcare infrastructure, precision optimization'
    },
    'Nairobi': {
      lat: -1.2921,
      lng: 36.8219,
      name: 'Nairobi, Kenya',
      population: '4.4M',
      aqi: 45,
      climate: 'Highland',
      risk: 'MODERATE',
      color: '#ffd60a',
      description: 'Developing infrastructure, balanced risk profile'
    }
  };

  const getRiskLevel = (riskValue) => {
    if (riskValue >= 0.7) return { level: 'HIGH', color: '#ff4d6d', intensity: 0.8 };
    if (riskValue >= 0.4) return { level: 'MODERATE', color: '#ffd60a', intensity: 0.5 };
    return { level: 'LOW', color: '#00e5ff', intensity: 0.3 };
  };

  useEffect(() => {
    if (!mapRef.current || mapLoaded) return;

    // Simple SVG map implementation (no external dependencies)
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '300');
    svg.setAttribute('viewBox', '0 0 400 300');
    svg.style.borderRadius = '8px';
    svg.style.background = 'rgba(0,10,20,0.8)';

    // Add world map background (simplified)
    const worldMap = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Add simplified continent shapes
    const continents = [
      // Asia
      { path: 'M250,80 L320,70 L340,120 L300,140 L260,120 Z', fill: 'rgba(255,255,255,0.05)' },
      // Africa  
      { path: 'M200,120 L240,110 L250,160 L220,180 L190,150 Z', fill: 'rgba(255,255,255,0.05)' },
      // Americas
      { path: 'M80,100 L120,90 L130,180 L90,190 L70,150 Z', fill: 'rgba(255,255,255,0.05)' },
    ];

    continents.forEach(continent => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', continent.path);
      path.setAttribute('fill', continent.fill);
      path.setAttribute('stroke', 'rgba(255,255,255,0.1)');
      path.setAttribute('stroke-width', '1');
      worldMap.appendChild(path);
    });

    svg.appendChild(worldMap);
    mapRef.current.appendChild(svg);

    // Add city markers
    Object.entries(cities).forEach(([cityKey, cityData]) => {
      const cityGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      cityGroup.style.cursor = 'pointer';
      cityGroup.setAttribute('data-city', cityKey);

      // Calculate position (simplified projection)
      const x = ((cityData.lng + 180) / 360) * 400;
      const y = ((90 - cityData.lat) / 180) * 300;

      // Risk circle
      const riskLevel = cityKey === currentCity && outbreakRisk !== null 
        ? getRiskLevel(outbreakRisk)
        : { level: cityData.risk, color: cityData.color, intensity: 0.6 };

      const riskCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      riskCircle.setAttribute('cx', x);
      riskCircle.setAttribute('cy', y);
      riskCircle.setAttribute('r', cityKey === selectedCity ? '25' : '20');
      riskCircle.setAttribute('fill', riskLevel.color);
      riskCircle.setAttribute('fill-opacity', riskLevel.intensity);
      riskCircle.setAttribute('stroke', riskLevel.color);
      riskCircle.setAttribute('stroke-width', '2');
      
      // Pulsing animation for selected city
      if (cityKey === selectedCity) {
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'r');
        animate.setAttribute('values', '20;30;20');
        animate.setAttribute('dur', '2s');
        animate.setAttribute('repeatCount', 'indefinite');
        riskCircle.appendChild(animate);
      }

      // City marker
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      marker.setAttribute('x', x);
      marker.setAttribute('y', y + 5);
      marker.setAttribute('text-anchor', 'middle');
      marker.setAttribute('fill', '#fff');
      marker.setAttribute('font-size', '16');
      marker.setAttribute('font-weight', 'bold');
      marker.textContent = cityKey === 'Singapore' ? '🏙️' : cityKey === 'Dhaka' ? '🌍' : '🌃';

      // City name
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', y + 20);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', '#fff');
      label.setAttribute('font-size', '10');
      label.textContent = cityKey;

      cityGroup.appendChild(riskCircle);
      cityGroup.appendChild(marker);
      cityGroup.appendChild(label);

      // Click handler
      cityGroup.addEventListener('click', () => {
        setSelectedCity(cityKey);
      });

      svg.appendChild(cityGroup);
    });

    setMapLoaded(true);
  }, [currentCity, outbreakRisk, selectedCity]);

  const selectedCityData = cities[selectedCity] || cities['Dhaka'];
  const currentRiskLevel = outbreakRisk !== null && selectedCity === currentCity 
    ? getRiskLevel(outbreakRisk)
    : { level: selectedCityData.risk, color: selectedCityData.color, intensity: 0.6 };

  return (
    <div style={{
      background: 'rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: 20,
      color: '#fff'
    }}>
      <div style={{ 
        fontSize: 16, 
        fontWeight: 600, 
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span style={{ fontSize: 20 }}>🗺️</span>
        One Health Geographic Intelligence
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef}
        style={{ 
          marginBottom: 16,
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      />

      {/* City Information */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        padding: 12,
        border: `1px solid ${currentRiskLevel.color}`
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8,
          marginBottom: 8
        }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: currentRiskLevel.color,
            opacity: currentRiskLevel.intensity
          }} />
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            {selectedCityData.name}
          </div>
          <div style={{
            background: `${currentRiskLevel.color}33`,
            color: currentRiskLevel.color,
            padding: '2px 6px',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 600,
            marginLeft: 'auto'
          }}>
            {currentRiskLevel.level} RISK
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 8,
          fontSize: 11,
          color: 'rgba(255,255,255,0.8)'
        }}>
          <div>Population: {selectedCityData.population}</div>
          <div>AQI: {selectedCityData.aqi}</div>
          <div>Climate: {selectedCityData.climate}</div>
          <div>
            {selectedCity === currentCity && outbreakRisk !== null 
              ? `Current Risk: ${(outbreakRisk * 100).toFixed(1)}%`
              : `Baseline Risk: ${selectedCityData.risk}`
            }
          </div>
        </div>

        <div style={{ 
          fontSize: 10, 
          color: 'rgba(255,255,255,0.6)', 
          marginTop: 8,
          fontStyle: 'italic'
        }}>
          {selectedCityData.description}
        </div>
      </div>

      {/* Legend */}
      <div style={{ 
        marginTop: 12, 
        fontSize: 10, 
        color: 'rgba(255,255,255,0.6)'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Risk Levels:</div>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ color: '#ff4d6d' }}>● High Risk</span>
          <span style={{ color: '#ffd60a' }}>● Moderate Risk</span>
          <span style={{ color: '#00e5ff' }}>● Low Risk</span>
        </div>
      </div>
    </div>
  );
};

export default OneHealthMap;
