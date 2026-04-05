import React, { useEffect, useState } from 'react';

// Generates a mock history array to make the chart look active
function generateMockHistory() {
  const pts = [];
  const count = 40;
  for (let i = 0; i < count; i++) {
    // mostly normal noise around 0.2, occasional jumps
    const isSpike = Math.random() > 0.95;
    const v = isSpike ? 0.6 + Math.random() * 0.3 : 0.1 + Math.random() * 0.2;
    pts.push(v);
  }
  return pts;
}

const AnomalyChart = ({ sentinelHistory, currentAnomaly }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(generateMockHistory());
  }, []);

  // Update data if an anomaly streams in
  useEffect(() => {
    if (currentAnomaly && currentAnomaly.zscore) {
      setData(prev => {
        const next = [...prev.slice(1)];
        // convert zscore to a normalized 0-1 range for the chart roughly
        // If zscore > 2.0, it's an anomaly. Let's map zscore 2.0 -> 0.7
        const val = Math.min(1.0, 0.2 + (currentAnomaly.zscore / 4));
        next.push(val);
        return next;
      });
    }
  }, [currentAnomaly]);

  const yLabels = [1.0, 0.75, 0.5, 0.25, 0.0];
  
  // Math bounds for the visualization
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const h = 200;
  const w = 500;
  
  // y pos scale: 1 -> 20, 0 -> 170
  const getY = (val) => 170 - (val * 150);
  
  // x pos scale: 0 -> 45, maxIdx -> 480
  const getX = (idx) => {
    if (data.length <= 1) return 45;
    const p = idx / (data.length - 1);
    return 45 + (p * 435);
  };

  const pathD = data.length > 0
    ? data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`).join(' ')
    : '';

  // mean line around 0.2
  const meanY = getY(0.2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      
      <svg width="100%" height={200} viewBox="0 0 500 200" preserveAspectRatio="xMidYMid meet" style={{ background: 'transparent' }}>
        
        {/* Horizontal Grid lines & Y Axis Labels */}
        {yLabels.map(val => {
          const yPos = getY(val);
          return (
            <g key={val}>
              <line 
                x1={padding.left} y1={yPos} 
                x2={480} y2={yPos} 
                stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3" 
              />
              <text 
                x={38} y={yPos + 3} 
                textAnchor="end" fontSize="9" 
                fill="rgba(255,255,255,0.3)" 
                fontFamily="IBM Plex Mono"
              >
                {val.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* TIME X-axis label */}
        <text 
          x={250} y={195} 
          textAnchor="middle" fontSize="9" 
          fill="rgba(255,255,255,0.3)" 
          fontFamily="IBM Plex Mono"
        >
          TIME
        </text>

        {/* Sigma Band Fill */}
        <rect 
          x={45} y={meanY - 20} 
          width={435} height={40} 
          fill="rgba(255,69,69,0.08)" 
        />

        {/* Mean baseline */}
        <line 
          x1={45} y1={meanY} 
          x2={480} y2={meanY} 
          stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="4,4" 
        />

        {/* Data Path */}
        {pathD && (
          <path 
            d={pathD} 
            fill="none" 
            stroke="#FFB800"
            strokeWidth="1.5" 
            style={{ transition: 'd 0.3s' }}
          />
        )}

        {/* Data Points */}
        {data.map((val, i) => {
          const isAnomaly = val > 0.6;
          if (!isAnomaly && i !== data.length - 1) return null; // Only render anomalies or the latest dot
          
          return (
            <circle 
              key={i} 
              cx={getX(i)} cy={getY(val)} 
              r={isAnomaly ? 4 : 2} 
              fill={isAnomaly ? '#FF4545' : '#FFB800'} 
            />
          );
        })}

      </svg>

      {/* Legend below SVG */}
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 8, paddingBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)' }}>
          <span style={{ color: '#FFB800' }}>■</span> NOMINAL
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)' }}>
          <span style={{ color: '#FF4545' }}>■</span> ANOMALY
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '-1px' }}>---</span> MEAN BASELINE
        </div>
      </div>

      {currentAnomaly && (
        <div style={{
          marginTop: 8,
          padding: 8,
          background: 'rgba(255,69,69,0.1)',
          borderLeft: '2px solid #FF4545',
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: '#FF4545'
        }}>
          ⚠️ Anomaly Detected: z-score = {currentAnomaly.zscore?.toFixed(2)} {'>'} 2.0
        </div>
      )}
    </div>
  );
};

export default AnomalyChart;
