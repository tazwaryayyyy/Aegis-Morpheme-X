import React, { useState, useEffect } from 'react';

const RetrainingNotification = ({ events }) => {
  const [sessions, setSessions] = useState([]);
  const [visible,  setVisible]  = useState(false);

  useEffect(() => {
    const retrainingEvents = events.filter(e => e.type === 'retraining_update');
    if (retrainingEvents.length === 0) return;

    const latest  = retrainingEvents[retrainingEvents.length - 1];
    const session = latest.session;

    setSessions(prev => {
      const existing = prev.find(s => s.session_id === session.session_id);
      return existing
        ? prev.map(s => s.session_id === session.session_id ? session : s)
        : [...prev, session];
    });

    setVisible(true);

    if (session.status === 'completed') {
      setTimeout(() => {
        setSessions(prev => prev.filter(s => s.session_id !== session.session_id));
      }, 5000);
    }
  }, [events]);

  const dismiss = (id) => {
    setSessions(prev => prev.filter(s => s.session_id !== id));
    if (sessions.length <= 1) setVisible(false);
  };

  if (!visible || sessions.length === 0) return null;

  return (
    <div className="retraining-overlay">
      {sessions.map(session => {
        const isDone = session.status === 'completed';
        const borderColor = isDone ? 'var(--green)' : 'var(--red)';

        return (
          <div
            key={session.session_id}
            className="retraining-card"
            style={{ borderLeft: `1px solid ${borderColor}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="agent-badge" style={{ borderColor }}>
                {isDone ? 'RETRAIN_SUCCESS' : 'RETRAIN_ACTIVE'}
              </span>
              <button 
                onClick={() => dismiss(session.session_id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
              >
                [X]
              </button>
            </div>

            <div className="dense-row">
              <span className="dense-label">AGENT_ID</span>
              <span className="dense-val">{isDone ? 'System Synced' : session.agent}</span>
            </div>
            
            <div className="dense-row">
              <span className="dense-label">STATUS</span>
              <span className="dense-val" style={{ color: isDone ? 'var(--green)' : 'var(--text-primary)' }}>
                {isDone 
                  ? `Err_Red: ${(session.error_reduction * 100).toFixed(1)}%` 
                  : session.phase_description || 'Initializing...'}
              </span>
            </div>

            {/* Progress bar */}
            {!isDone && session.progress !== undefined && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 9, textAlign: 'right', marginBottom: 4 }}>
                  {Math.round(session.progress)}%
                </div>
                <div className="retrain-progress-bar">
                  <div
                    className="retrain-progress-fill"
                    style={{ width: `${session.progress}%`, background: 'var(--red)' }}
                  />
                </div>
              </div>
            )}

            {/* Details */}
            {isDone && (
              <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div className="dense-row">
                  <span className="dense-label">PERF_DELTA</span>
                  <span className="dense-val">+{(session.performance_improvement * 100).toFixed(1)}%</span>
                </div>
                <div className="dense-row">
                  <span className="dense-label">NEG_SAMPLES</span>
                  <span className="dense-val">{session.hard_negatives_added}</span>
                </div>
                <div className="dense-row">
                  <span className="dense-label">MDL_HASH</span>
                  <span className="dense-val">{session.new_model_hash?.slice(0, 16)}...</span>
                </div>
              </div>
            )}
            
            {!isDone && (
              <div style={{ marginTop: 12, fontSize: 10, color: 'var(--red)' }}>
                {'>'} Penalty enforced: {session.penalty_percent}% stake slashed
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RetrainingNotification;
