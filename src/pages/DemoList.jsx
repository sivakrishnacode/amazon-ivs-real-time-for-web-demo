import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsernameStore } from '../stores/useUsernameStore.js';
import { useStageStore } from '../stores/useStageStore.js';
import { fetchDemoToken } from '../utils/stage.js';
import UserAvatar from '../components/ui/UserAvatar.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { VideoCamera, Broadcast, Gear, ArrowRight, BoxingGlove, UserSquare } from '@phosphor-icons/react';

const DEMOS = [
  {
    id: 'meeting',
    path: '/demos/meeting',
    name: 'Meeting Demo',
    description: 'Google Meet style standard video conferencing',
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
    description: 'Dual stream combat battle with live interactive votes',
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
  const { username, init } = useUsernameStore();
  const leaveStage = useStageStore((s) => s.leaveStage);
  const connectToStage = useStageStore((s) => s.connectToStage);
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    init();
    leaveStage();

    // Check for a shared meeting link
    const params = new URLSearchParams(window.location.search);
    const sharedHostId = params.get('hostId');
    if (sharedHostId) {
      const demo = DEMOS.find((d) => d.id === 'meeting');
      if (demo) {
        // Wait slightly for store username initialization to finish
        setTimeout(() => {
          const currentUsername = useUsernameStore.getState().username || 'Guest';
          handleSelect(demo, sharedHostId, currentUsername);
        }, 100);
      }
    }
  }, []);

  const handleSelect = async (demo, sharedHostId = null, currentUsername = null) => {
    setLoading(demo.id);
    const activeUsername = currentUsername || username;
    try {
      let token = '';
      try {
        token = await fetchDemoToken(activeUsername, demo.id, sharedHostId);
      } catch (err) {
        console.warn('Backend fetch failed, using local storage/prompt fallback:', err);
      }

      const storageKey = `ivs-saved-token-${demo.id}`;
      if (!token) {
        token = localStorage.getItem(storageKey) || '';
        if (!token) {
          const userInput = window.prompt(
            `Amazon IVS stage token could not be fetched automatically (often due to CORS restrictions). ` +
            `Please paste a valid Stage Join Token for the "${demo.name}" demo:`
          );
          if (userInput) {
            token = userInput.trim();
            localStorage.setItem(storageKey, token);
          }
        }
      }

      if (!token) {
        alert('A valid Stage Join Token is required to access the demo.');
        return;
      }

      await connectToStage(token);
      
      // Preserve hostId in route if joining as guest
      const path = sharedHostId ? `${demo.path}?hostId=${sharedHostId}` : demo.path;
      navigate(path);
    } catch (err) {
      console.error('Failed to load demo:', err);
      localStorage.removeItem(`ivs-saved-token-${demo.id}`);
      alert(`Error joining stage: ${err.message || err}`);
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
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{username}</div>
          </div>
        </div>
        <button className="icon-btn" onClick={() => navigate('/settings')} aria-label="Settings">
          <Gear size={20} />
        </button>
      </header>

      <div className="demo-list-body">
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 8 }}>
          Choose a live interactive demo to join
        </p>
        {DEMOS.map((demo) => (
          <button
            key={demo.id}
            className="demo-card"
            onClick={() => handleSelect(demo)}
            disabled={!!loading}
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
