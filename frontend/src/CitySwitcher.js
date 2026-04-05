import React, { useState, useEffect } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const CitySwitcher = ({ onCityChange }) => {
  const [currentCity,     setCurrentCity]     = useState('Dhaka');
  const [availableCities, setAvailableCities] = useState({});
  const [loading,         setLoading]         = useState(false);
  const [cityConfig,      setCityConfig]      = useState(null);
  const [loadingText,     setLoadingText]     = useState('');
  
  // Loading Typewriter logic
  useEffect(() => {
    if (cityConfig) return;
    const msg = '> INITIATING GEO_LAYER...';
    let i = 0;
    const t = setInterval(() => {
      setLoadingText(msg.slice(0, i));
      i++;
      if (i > msg.length) clearInterval(t);
    }, 60);
    return () => clearInterval(t);
  }, [cityConfig]);

  useEffect(() => {
    const load = async () => {
      try {
        const [citiesRes, currentRes] = await Promise.all([
          fetch(`${API_BASE}/api/city/available`),
          fetch(`${API_BASE}/api/city/current`),
        ]);
        const cities  = await citiesRes.json();
        const current = await currentRes.json();
        // Artificial delay so the typewriter finishes (since this is visually requested)
        setTimeout(() => {
          setAvailableCities(cities.cities);
          setCurrentCity(current.city);
          setCityConfig(current.config);
        }, 1800);
      } catch (err) {
        console.error('[CitySwitcher] load failed:', err);
      }
    };
    load();
  }, []);

  const handleSwitch = async (city) => {
    if (city === currentCity || loading) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/city/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city }),
      });
      const data = await res.json();
      setCurrentCity(data.city);
      setCityConfig(data.config);
      if (onCityChange) onCityChange(data.city, data.config);
    } catch (err) {
      console.error('[CitySwitcher] switch failed:', err);
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  if (!cityConfig) {
    return (
      <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', padding: '32px 16px' }}>
        {loadingText}<span className="cursor-blink" style={{ color: 'var(--cyan)' }}>_</span>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header">
        <div className="card-title">[LOC] Base Station</div>
        <span className="agent-badge">{loading ? 'SWITCHING...' : 'SYNCED'}</span>
      </div>

      {/* Current city */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
        <div className="dense-row">
          <span className="dense-label">CITY_ID</span>
          <span className="dense-val text-cyan">{currentCity.toUpperCase()}</span>
        </div>
        <div className="dense-row">
          <span className="dense-label">POPULATION</span>
          <span className="dense-val">{cityConfig.population}</span>
        </div>
        <div className="dense-row">
          <span className="dense-label">AQI_AVG</span>
          <span className="dense-val text-cyan">{cityConfig.aqi_avg}</span>
        </div>
        <div className="dense-row">
          <span className="dense-label">POV_INDEX</span>
          <span className="dense-val">{(cityConfig.poverty_index * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* City buttons - removing old logic since prompt specifies the geo layer tab switcher */}
      <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
        {'>'} NODE SWITCHING AVAILABLE VIA GEO_INTELLIGENCE MAP
      </div>
    </div>
  );
};

export default CitySwitcher;
