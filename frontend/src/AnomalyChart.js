/**
 * AMX Protocol – Anomaly Visualization Chart
 * Shows agent outputs with mean and ±2σ bands, highlighting anomalies
 */

import React from 'react';

const AnomalyChart = ({ sentinelHistory = [], currentAnomaly = null }) => {
  // Sample data if no history provided
  const data = sentinelHistory.length > 0 ? sentinelHistory : [
    { value: 0.5, timestamp: Date.now() - 5000, mean: 0.5, std: 0.1, anomaly: false },
    { value: 0.6, timestamp: Date.now() - 4000, mean: 0.52, std: 0.12, anomaly: false },
    { value: 0.4, timestamp: Date.now() - 3000, mean: 0.5, std: 0.13, anomaly: false },
    { value: 0.7, timestamp: Date.now() - 2000, mean: 0.53, std: 0.14, anomaly: false },
    { value: 0.5, timestamp: Date.now() - 1000, mean: 0.54, std: 0.15, anomaly: false },
    { value: 2.5, timestamp: Date.now(), mean: 0.56, std: 0.16, anomaly: true }, // Anomaly
  ];

  const width = 400;
  const height = 150;
  const padding = 20;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Calculate scales
  const values = data.map(d => d.value);
  const minValue = Math.min(...values) - 0.5;
  const maxValue = Math.max(...values) + 0.5;
  const valueRange = maxValue - minValue;

  const xScale = (i) => padding + (i / (data.length - 1)) * chartWidth;
  const yScale = (v) => padding + chartHeight - ((v - minValue) / valueRange) * chartHeight;

  // Generate SVG path for mean line
  const meanPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.mean)}`).join(' ');

  // Generate paths for ±2σ bands
  const upperBandPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.mean + 2 * d.std)}`).join(' ');
  const lowerBandPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.mean - 2 * d.std)}`).join(' ');

  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 12, border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: '#fff' }}>
        Meta-Sentinel Anomaly Detection
      </div>
      
      <svg width={width} height={height} style={{ background: 'rgba(0,10,20,0.5)', borderRadius: 4 }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(tick => (
          <g key={tick}>
            <line
              x1={padding}
              y1={yScale(tick)}
              x2={width - padding}
              y2={yScale(tick)}
              stroke="rgba(255,255,255,0.1)"
              strokeDasharray="2,2"
            />
            <text
              x={padding - 5}
              y={yScale(tick) + 3}
              fill="rgba(255,255,255,0.5)"
              fontSize="10"
              textAnchor="end"
            >
              {tick.toFixed(1)}
            </text>
          </g>
        ))}

        {/* ±2σ bands */}
        <path
          d={`${upperBandPath} L ${xScale(data.length - 1)} ${yScale(data[data.length - 1].mean - 2 * data[data.length - 1].std)} L ${xScale(0)} ${yScale(data[0].mean - 2 * data[0].std)} Z`}
          fill="rgba(255,77,109,0.1)"
          stroke="rgba(255,77,109,0.3)"
          strokeWidth="1"
        />

        {/* Mean line */}
        <path
          d={meanPath}
          fill="none"
          stroke="rgba(0,229,255,0.8)"
          strokeWidth="2"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={xScale(i)}
            cy={yScale(d.value)}
            r="4"
            fill={d.anomaly ? '#ff4d6d' : '#00e5ff'}
            stroke={d.anomaly ? '#ff8fab' : '#00b8d4'}
            strokeWidth="2"
          />
        ))}

        {/* Labels */}
        <text x={width / 2} y={height - 2} fill="rgba(255,255,255,0.6)" fontSize="10" textAnchor="middle">
          Time &rarr;
        </text>
        <text x={2} y={padding} fill="rgba(255,255,255,0.6)" fontSize="10">
          Value &rarr;
        </text>

        {/* Legend */}
        <g transform={`translate(${width - 80}, 10)`}>
          <rect x="0" y="0" width="8" height="8" fill="#00e5ff" />
          <text x="10" y="6" fill="rgba(255,255,255,0.8)" fontSize="9">Normal</text>
          
          <rect x="0" y="12" width="8" height="8" fill="#ff4d6d" />
          <text x="10" y="18" fill="rgba(255,255,255,0.8)" fontSize="9">Anomaly</text>
          
          <line x1="0" y1="26" x2="8" y2="26" stroke="rgba(0,229,255,0.8)" strokeWidth="2" />
          <text x="10" y="29" fill="rgba(255,255,255,0.8)" fontSize="9">Mean</text>
        </g>
      </svg>

      {currentAnomaly && (
        <div style={{ 
          marginTop: 8, 
          padding: 6, 
          background: 'rgba(255,77,109,0.2)', 
          border: '1px solid rgba(255,77,109,0.5)', 
          borderRadius: 4,
          fontSize: 11,
          color: '#ff8fab'
        }}>
          ⚠️ Anomaly Detected: z-score = {currentAnomaly.zscore?.toFixed(2)} > 2.0
        </div>
      )}
    </div>
  );
};

export default AnomalyChart;
