/**
 * AMX Protocol – Dynamic City Switcher Component
 * Allows real-time switching between cities with different risk profiles
 */

import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const CitySwitcher = ({ onCityChange }) => {
  const [currentCity, setCurrentCity] = useState('Dhaka');
  const [availableCities, setAvailableCities] = useState({});
  const [loading, setLoading] = useState(false);
  const [cityConfig, setCityConfig] = useState(null);
  const [switchingTo, setSwitchingTo] = useState(null);

  // Load available cities on mount
  useEffect(() => {
    loadAvailableCities();
    loadCurrentCity();
  }, []);

  const loadAvailableCities = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/city/available`);
      const data = await response.json();
      setAvailableCities(data.cities);
    } catch (error) {
      console.error('Failed to load available cities:', error);
    }
  };

  const loadCurrentCity = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/city/current`);
      const data = await response.json();
      setCurrentCity(data.city);
      setCityConfig(data.config);
    } catch (error) {
      console.error('Failed to load current city:', error);
    }
  };

  const handleCitySwitch = async (city) => {
    if (city === currentCity || loading) return;
    
    setLoading(true);
    setSwitchingTo(city);
    
    try {
      const response = await fetch(`${API_BASE}/api/city/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city })
      });
      
      const data = await response.json();
      setCurrentCity(data.city);
      setCityConfig(data.config);
      
      // Notify parent component
      if (onCityChange) {
        onCityChange(data.city, data.config);
      }
      
      // Visual feedback - success
      setTimeout(() => {
        setSwitchingTo(null);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to switch city:', error);
      setSwitchingTo(null);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  };

  const getCityColor = (city) => {
    const colors = {
      'Dhaka': '#ff4d6d',      // Red - high risk
      'Singapore': '#00e5ff',   // Cyan - low risk  
      'Nairobi': '#ffd60a'      // Yellow - moderate risk
    };
    return colors[city] || '#666';
  };

  const getCityIcon = (city) => {
    const icons = {
      'Dhaka': '🏙️',
      'Singapore': '🌆', 
      'Nairobi': '🌃'
    };
    return icons[city] || '🏙️';
  };

  if (!cityConfig) {
    return (
      <div style={{ 
        padding: 12, 
        background: 'rgba(0,0,0,0.3)', 
        borderRadius: 8, 
        textAlign: 'center',
        color: '#fff',
        fontSize: 12
      }}>
        Loading cities...
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: 16,
      color: '#fff'
    }}>
      <div style={{ 
        fontSize: 14, 
        fontWeight: 600, 
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span style={{ fontSize: 18 }}>🌍</span>
        Global City Switcher
      </div>
      
      {/* Current City Display */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        border: `2px solid ${getCityColor(currentCity)}`,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Switching animation overlay */}
        {switchingTo && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(90deg, transparent, ${getCityColor(switchingTo)}33, transparent)`,
            animation: 'slideIn 0.8s ease-out',
            zIndex: 1
          }} />
        )}
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          marginBottom: 8,
          position: 'relative',
          zIndex: 2
        }}>
          <span style={{ 
            fontSize: 24,
            animation: switchingTo ? 'pulse 1s infinite' : 'none'
          }}>
            {getCityIcon(currentCity)}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {switchingTo ? `Switching to ${switchingTo}...` : currentCity}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
              {cityConfig.country} · {cityConfig.population}
            </div>
          </div>
          {switchingTo && (
            <div style={{
              fontSize: 16,
              animation: 'spin 1s linear infinite'
            }}>
              🔄
            </div>
          )}
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 8,
          fontSize: 10,
          color: 'rgba(255,255,255,0.8)',
          position: 'relative',
          zIndex: 2
        }}>
          <div>AQI: {cityConfig.aqi_avg}</div>
          <div>Poverty: {(cityConfig.poverty_index * 100).toFixed(0)}%</div>
          <div>Climate: {cityConfig.climate}</div>
          <div>Threshold: {cityConfig.base_threshold}</div>
        </div>
      </div>

      {/* City Selection Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.keys(availableCities).map(city => (
          <button
            key={city}
            onClick={() => handleCitySwitch(city)}
            disabled={city === currentCity || loading}
            style={{
              background: city === currentCity 
                ? `${getCityColor(city)}33` 
                : 'rgba(255,255,255,0.05)',
              border: city === currentCity 
                ? `2px solid ${getCityColor(city)}` 
                : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              padding: 10,
              color: '#fff',
              cursor: city === currentCity ? 'default' : 'pointer',
              opacity: city === currentCity ? 0.7 : 1,
              transition: 'all 0.2s',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
            onMouseEnter={(e) => {
              if (city !== currentCity) {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = getCityColor(city);
              }
            }}
            onMouseLeave={(e) => {
              if (city !== currentCity) {
                e.target.style.background = 'rgba(255,255,255,0.05)';
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
              }
            }}
          >
            <span>{getCityIcon(city)}</span>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{city}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                {availableCities[city].description}
              </div>
            </div>
            {city === currentCity && (
              <span style={{ fontSize: 16 }}>✓</span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: 8, 
          fontSize: 11, 
          color: 'rgba(255,255,255,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}>
          <div style={{
            width: 8,
            height: 8,
            background: getCityColor(switchingTo || currentCity),
            borderRadius: '50%',
            animation: 'pulse 1s infinite'
          }} />
          {switchingTo ? `Updating to ${switchingTo}...` : 'Processing city data...'}
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default CitySwitcher;
