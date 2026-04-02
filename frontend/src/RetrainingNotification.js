/**
 * AMX Protocol - Automated Retraining Notification
 * Shows visual feedback when agents are being retrained after anomalies
 */

import React, { useState, useEffect } from 'react';

const RetrainingNotification = ({ events }) => {
  const [retrainingSessions, setRetrainingSessions] = useState([]);
  const [visible, setVisible] = useState(false);

  // Listen for retraining events
  useEffect(() => {
    const retrainingEvents = events.filter(e => e.type === 'retraining_update');
    
    if (retrainingEvents.length > 0) {
      const latestEvent = retrainingEvents[retrainingEvents.length - 1];
      const session = latestEvent.session;
      
      setRetrainingSessions(prev => {
        const existing = prev.find(s => s.session_id === session.session_id);
        if (existing) {
          return prev.map(s => s.session_id === session.session_id ? session : s);
        } else {
          return [...prev, session];
        }
      });
      
      setVisible(true);
      
      // Auto-hide after completion
      if (session.status === 'completed') {
        setTimeout(() => {
          setRetrainingSessions(prev => 
            prev.filter(s => s.session_id !== session.session_id)
          );
          
          if (retrainingSessions.length <= 1) {
            setVisible(false);
          }
        }, 5000);
      }
    }
  }, [events, retrainingSessions.length]);

  const getPhaseIcon = (phase) => {
    const icons = {
      'loading_data': '📊',
      'preprocessing': '🔄',
      'training': '🧠',
      'validation': '✅',
      'deployment': '🚀'
    };
    return icons[phase] || '⚙️';
  };

  const getStatusColor = (status) => {
    const colors = {
      'queued': '#ffd60a',
      'running': '#00e5ff',
      'completed': '#00ff88'
    };
    return colors[status] || '#666';
  };

  if (!visible || retrainingSessions.length === 0) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 1000,
      maxWidth: 400,
      animation: 'slideInRight 0.5s ease-out'
    }}>
      {retrainingSessions.map(session => (
        <div
          key={session.session_id}
          style={{
            background: 'rgba(0,0,0,0.9)',
            border: `2px solid ${getStatusColor(session.status)}`,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            color: '#fff',
            backdropFilter: 'blur(10px)',
            boxShadow: `0 8px 32px ${getStatusColor(session.status)}33`
          }}
        >
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            marginBottom: 12
          }}>
            <div style={{
              fontSize: 20,
              animation: session.status === 'running' ? 'pulse 1.5s infinite' : 'none'
            }}>
              🔄
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {session.status === 'completed' 
                  ? '✅ Agent Retraining Complete!' 
                  : `🔄 Retraining ${session.agent} Agent...`
                }
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                {session.status === 'completed' 
                  ? `Error rate reduced by ${(session.error_reduction * 100).toFixed(1)}%`
                  : session.phase_description || 'Initializing...'
                }
              </div>
            </div>
          </div>

          {/* Progress Bar (for running sessions) */}
          {session.status === 'running' && session.progress !== undefined && (
            <div style={{ marginBottom: 12 }}>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 4,
                height: 6,
                overflow: 'hidden'
              }}>
                <div style={{
                  background: getStatusColor(session.status),
                  height: '100%',
                  width: `${session.progress}%`,
                  transition: 'width 0.3s ease',
                  borderRadius: 4
                }} />
              </div>
              <div style={{ 
                fontSize: 10, 
                color: 'rgba(255,255,255,0.6)', 
                marginTop: 4,
                textAlign: 'right'
              }}>
                {Math.round(session.progress)}%
              </div>
            </div>
          )}

          {/* Details */}
          <div style={{ 
            fontSize: 11, 
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.4
          }}>
            {session.status === 'completed' ? (
              <>
                <div>🎯 Performance improved by {(session.performance_improvement * 100).toFixed(1)}%</div>
                <div>📚 {session.hard_negatives_added} new hard examples added</div>
                <div>⏱️ Training completed in {session.duration_seconds}s</div>
                <div>🔗 Model: {session.new_model_hash?.slice(0, 20)}...</div>
              </>
            ) : (
              <>
                <div>🤖 Agent: {session.agent}</div>
                <div>⚡ Phase: {getPhaseIcon(session.current_phase)} {session.phase_description}</div>
                <div>💰 Penalty: {session.penalty_percent}% stake slashed</div>
              </>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setRetrainingSessions(prev => 
                prev.filter(s => s.session_id !== session.session_id)
              );
              if (retrainingSessions.length <= 1) {
                setVisible(false);
              }
            }}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 4,
              width: 20,
              height: 20,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      ))}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default RetrainingNotification;
