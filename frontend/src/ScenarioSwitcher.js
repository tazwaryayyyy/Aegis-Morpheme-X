/**
 * AMX Protocol - Professional Scenario Switcher
 * One-click scenario execution with smooth animations and visual feedback
 */

import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ScenarioSwitcher = ({ onScenarioExecute, disabled = false }) => {
  const [activeScenario, setActiveScenario] = useState(null);
  const [loading, setLoading] = useState(false);

  const scenarios = [
    {
      id: 'dhaka-crisis',
      name: '🌍 Dhaka Crisis',
      description: 'High environmental stress, urgent healthcare needs',
      city: 'Dhaka',
      scenario: 'normal',
      color: '#ff4d6d',
      bgColor: 'rgba(255, 77, 109, 0.1)',
      borderColor: '#ff4d6d',
      icon: '🚨',
      impact: 'High'
    },
    {
      id: 'singapore-optimization', 
      name: '🏙️ Singapore Optimization',
      description: 'Precision healthcare enhancement in advanced infrastructure',
      city: 'Singapore',
      scenario: 'normal',
      color: '#00e5ff',
      bgColor: 'rgba(0, 229, 255, 0.1)',
      borderColor: '#00e5ff',
      icon: '⚡',
      impact: 'Medium'
    },
    {
      id: 'anomaly-injection',
      name: '⚠️ Anomaly Injection',
      description: 'Force anomaly detection and economic slashing',
      city: 'Dhaka',
      scenario: 'anomaly',
      color: '#ffd60a',
      bgColor: 'rgba(255, 214, 10, 0.1)',
      borderColor: '#ffd60a',
      icon: '💥',
      impact: 'Critical'
    }
  ];

  const executeScenario = async (scenario) => {
    if (loading || disabled) return;
    
    setLoading(true);
    setActiveScenario(scenario.id);
    
    try {
      // Step 1: Switch city if needed
      if (scenario.city) {
        await fetch(`${API_BASE}/api/city/switch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city: scenario.city })
        });
      }

      // Step 2: Execute scenario
      const response = await fetch(`${API_BASE}/api/simulate/cough?scenario=${scenario.scenario}`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      // Step 3: Notify parent
      if (onScenarioExecute) {
        onScenarioExecute(scenario, result);
      }
      
    } catch (error) {
      console.error('Scenario execution failed:', error);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setActiveScenario(null);
      }, 2000); // Keep active state for visual feedback
    }
  };

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
        <span style={{ fontSize: 20 }}>🎯</span>
        One-Click Scenario Execution
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {scenarios.map(scenario => (
          <button
            key={scenario.id}
            onClick={() => executeScenario(scenario)}
            disabled={disabled || loading}
            style={{
              background: activeScenario === scenario.id 
                ? scenario.bgColor 
                : 'rgba(255,255,255,0.05)',
              border: activeScenario === scenario.id
                ? `2px solid ${scenario.borderColor}`
                : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: 16,
              cursor: disabled || loading ? 'not-allowed' : 'pointer',
              opacity: disabled || loading ? 0.6 : 1,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontSize: 14,
              textAlign: 'left',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!disabled && !loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.background = scenario.bgColor;
                e.target.style.borderColor = scenario.borderColor;
                e.target.style.boxShadow = `0 8px 25px ${scenario.color}33`;
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled && !loading && activeScenario !== scenario.id) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.background = 'rgba(255,255,255,0.05)';
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {/* Pulse animation for active scenario */}
            {activeScenario === scenario.id && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(90deg, transparent, ${scenario.color}33, transparent)`,
                animation: 'pulse 1.5s infinite',
                pointerEvents: 'none'
              }} />
            )}
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                fontSize: 32,
                lineHeight: 1,
                animation: activeScenario === scenario.id ? 'bounce 1s infinite' : 'none'
              }}>
                {scenario.icon}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: 600, 
                  marginBottom: 4,
                  color: scenario.color,
                  fontSize: 15
                }}>
                  {scenario.name}
                </div>
                <div style={{ 
                  fontSize: 12, 
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: 6,
                  lineHeight: 1.3
                }}>
                  {scenario.description}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8,
                  fontSize: 11
                }}>
                  <span style={{
                    background: `${scenario.color}33`,
                    color: scenario.color,
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontWeight: 500
                  }}>
                    Impact: {scenario.impact}
                  </span>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                    City: {scenario.city}
                  </span>
                </div>
              </div>
              
              {activeScenario === scenario.id && (
                <div style={{
                  fontSize: 20,
                  animation: 'spin 1s linear infinite'
                }}>
                  ⚙️
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: 12, 
          fontSize: 12, 
          color: 'rgba(255,255,255,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}>
          <div style={{
            width: 8,
            height: 8,
            background: '#00e5ff',
            borderRadius: '50%',
            animation: 'pulse 1s infinite'
          }} />
          Executing scenario pipeline...
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.8; }
          100% { opacity: 0.3; }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
          60% { transform: translateY(-3px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ScenarioSwitcher;
