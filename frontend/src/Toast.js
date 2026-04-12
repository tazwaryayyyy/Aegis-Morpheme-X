import React, { useEffect, useState } from 'react';

const Toast = ({ message, isVisible, onClose, duration = 3000 }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  if (!shouldRender && !isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 20px',
      background: '#0a0a0a',
      borderLeft: '4px solid var(--acid)',
      borderRadius: '4px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      color: '#fff',
      fontFamily: 'var(--font-mono)',
      fontSize: '12px',
      letterSpacing: '0.05em',
      pointerEvents: 'none',
      animation: isVisible ? 'toastIn 0.3s ease-out forwards' : 'toastOut 0.3s ease-in forwards'
    }}>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(20px); }
        }
      `}</style>
      <span style={{ color: 'var(--acid)', fontWeight: 'bold' }}>✓</span>
      {message}
    </div>
  );
};

export default Toast;
