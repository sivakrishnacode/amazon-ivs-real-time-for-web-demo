import React from 'react';

export default function LoadingSpinner({ fullScreen = true, text = 'Loading…' }) {
  const inner = (
    <>
      <div style={{
        width: 36, height: 36,
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: 'var(--blue)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {text && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{text}</span>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );

  if (!fullScreen) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{inner}</div>;

  return <div className="loading-fullscreen">{inner}</div>;
}
