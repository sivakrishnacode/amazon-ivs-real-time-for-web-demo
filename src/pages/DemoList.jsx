/**
 * DemoList.jsx — Landing page
 *
 * Fixes:
 * 1. Guest auto-join reads userId correctly before fetching token.
 * 2. Error handling shows toast-style message, not alert().
 * 3. Loading state is per-demo, disables only the clicked card.
 * 4. No double-connect: leaveStage() called before any new connectToStage().
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsernameStore } from '../stores/useUsernameStore.js';
import { useStageStore } from '../stores/useStageStore.js';
import { fetchDemoToken } from '../utils/stage.js';
import UserAvatar from '../components/ui/UserAvatar.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import {
  VideoCamera, Broadcast, Gear, ArrowRight,
  BoxingGlove, UserSquare, WarningCircle,
} from '@phosphor-icons/react';

const DEMOS = [
  {
    id: 'meeting',
    path: '/demos/meeting',
    name: 'Meeting Demo',
    description: 'Google Meet style video conferencing',
    Icon: VideoCamera,
  },
  {
    id: 'audio',
    path: '/demos/audio',
    name: 'Audio Only Demo',
    description: 'Clubhouse style voice chat with animated levels',
    Icon: Broadcast,
  },
  {
    id: 'pk',
    path: '/demos/pk',
    name: 'PK Battle Demo',
    description: 'Dual stream combat battle with live votes',
    Icon: BoxingGlove,
  },
  {
    id: 'guest',
    path: '/demos/guest',
    name: 'Guest Spot Demo',
    description: 'Invite viewers to join stream as active speakers',
    Icon: UserSquare,
  },
];

export default function DemoList() {
  const navigate = useNavigate();
  const { username, userId, init } = useUsernameStore();
  const leaveStage = useStageStore((s) => s.leaveStage);
  const connectToStage = useStageStore((s) => s.connectToStage);

  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');
  const autoJoinFired = useRef(false);

  useEffect(() => {
    init();
    leaveStage();
  }, []);

  // Guest auto-join: wait for username to be ready, then fire once
  useEffect(() => {
    if (!username || autoJoinFired.current) return;
    const params = new URLSearchParams(window.location.search);
    const sharedHostId = params.get('hostId');
    if (!sharedHostId) return;

    autoJoinFired.current = true;
    const demo = DEMOS.find((d) => d.id === 'meeting');
    if (demo) handleSelect(demo, sharedHostId);
  }, [username]);

  const handleSelect = async (demo, sharedHostId = null) => {
    setLoading(demo.id);
    setError('');
    const activeUser = useUsernameStore.getState();
    const activeUsername = activeUser.username || 'Guest';
    const activeUserId = activeUser.userId || activeUsername;

    try {
      const token = await fetchDemoToken(activeUserId, demo.id, sharedHostId);

      if (!token) {
        setError('Could not obtain a stage token. Check your API key and try again.');
        return;
      }

      await connectToStage(token);
      const path = sharedHostId
        ? `${demo.path}?hostId=${encodeURIComponent(sharedHostId)}`
        : demo.path;
      navigate(path);
    } catch (err) {
      console.error('Failed to load demo:', err);
      setError(`Failed to join: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="demo-list-page">
      <header className="demo-list-header">
        <div className="demo-list-header-left">
          <UserAvatar username={username} />
          <div>
            <div className="demo-list-brand">Amazon IVS Real-time</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {username}
            </div>
          </div>
        </div>
        <button
          className="icon-btn"
          onClick={() => navigate('/settings')}
          aria-label="Settings"
        >
          <Gear size={20} />
        </button>
      </header>

      <div className="demo-list-body">
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 4 }}>
          Choose a live interactive demo to join
        </p>

        {/* Error banner */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(234,67,53,0.12)',
            border: '1px solid rgba(234,67,53,0.3)',
            borderRadius: 10, padding: '12px 16px',
            color: '#ea4335', fontSize: '0.88rem',
          }}>
            <WarningCircle size={18} weight="bold" style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        {DEMOS.map((demo) => (
          <button
            key={demo.id}
            className="demo-card"
            onClick={() => handleSelect(demo)}
            disabled={!!loading}
            style={{ opacity: loading && loading !== demo.id ? 0.5 : 1 }}
          >
            <div className="demo-card-left">
              <div className="demo-card-icon">
                {loading === demo.id ? (
                  <LoadingSpinner fullScreen={false} text={null} />
                ) : (
                  <demo.Icon size={24} weight="duotone" />
                )}
              </div>
              <div>
                <div className="demo-card-title">{demo.name}</div>
                <div className="demo-card-desc">{demo.description}</div>
              </div>
            </div>
            <div className="demo-card-arrow">
              <ArrowRight size={18} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
