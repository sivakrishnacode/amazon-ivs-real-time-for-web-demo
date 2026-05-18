import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsernameStore } from '../stores/useUsernameStore.js';
import { ArrowLeft, Trash } from '@phosphor-icons/react';

export default function Settings() {
  const navigate = useNavigate();
  const { username, setUsername, init } = useUsernameStore();
  const [nameInput, setNameInput] = useState('');

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (username) {
      setNameInput(username);
    }
  }, [username]);

  const handleSave = (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    navigate('/demos');
  };

  const clearSavedTokens = () => {
    const keys = ['meeting', 'audio', 'pk', 'guest'];
    keys.forEach((k) => {
      localStorage.removeItem(`ivs-saved-token-${k}`);
    });
    alert('All cached Amazon IVS tokens successfully cleared!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header className="demo-list-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="icon-btn" onClick={() => navigate('/demos')} aria-label="Go Back">
            <ArrowLeft size={20} />
          </button>
          <div className="demo-list-brand">Settings</div>
        </div>
      </header>

      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Display Username
          </label>
          <input
            type="text"
            className="text-input"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">
            Save Username
          </button>
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Troubleshooting
          </label>
          <button
            onClick={clearSavedTokens}
            className="btn-primary"
            style={{
              background: 'transparent',
              border: '1px solid var(--red)',
              color: 'var(--red)',
              boxShadow: 'none',
            }}
          >
            <Trash size={20} />
            Clear Cached IVS Tokens
          </button>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Clearing tokens will force the application to prompt for fresh Amazon IVS Stage tokens next time a demo is joined.
          </p>
        </div>
      </div>
    </div>
  );
}
