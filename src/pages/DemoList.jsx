import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsernameStore } from '../stores/useUsernameStore.js';
import { useStageStore } from '../stores/useStageStore.js';
import { fetchDemoToken, fetchActiveStreams } from '../utils/stage.js';
import UserAvatar from '../components/ui/UserAvatar.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { VideoCamera, Broadcast, Gear, ArrowRight, BoxingGlove, UserSquare, ArrowsCounterClockwise } from '@phosphor-icons/react';

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
  const [activeStreams, setActiveStreams] = useState([]);
  const [refreshingStreams, setRefreshingStreams] = useState(false);

  useEffect(() => {
    init();
    leaveStage();
    loadStreams();

    // Check for a shared meeting link
    const params = new URLSearchParams(window.location.search);
    const sharedHostId = params.get('hostId');
    if (sharedHostId) {
      const demo = DEMOS.find((d) => d.id === 'meeting');
      if (demo) {
        setTimeout(() => {
          const currentUsername = useUsernameStore.getState().username || 'Guest';
          handleSelect(demo, sharedHostId, currentUsername);
        }, 100);
      }
    }
  }, []);

  const loadStreams = async () => {
    setRefreshingStreams(true);
    try {
      const streams = await fetchActiveStreams();
      // Filter out any invalid/empty host stages
      setActiveStreams(streams.filter(s => s.hostId));
    } catch (err) {
      console.warn('Failed to retrieve active streams:', err);
    } finally {
      setRefreshingStreams(false);
    }
  };

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

  const handleJoinActiveStream = (stream) => {
    // Map stage type string (VIDEO/AUDIO) to our local DEMO options
    const isAudio = stream.type === 'AUDIO';
    const demoId = isAudio ? 'audio' : 'meeting';
    const demo = DEMOS.find(d => d.id === demoId);
    
    if (demo) {
      handleSelect(demo, stream.hostId);
    }
  };

  const getFormatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
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
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
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

        {/* Dynamic List of Available Active Streams */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="live-indicator-pulse"></span>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Active Live Streams
              </h3>
            </div>
            <button 
              className="icon-btn" 
              onClick={loadStreams} 
              disabled={refreshingStreams}
              style={{
                background: 'rgba(255,255,255,0.05)',
                padding: 6,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <ArrowsCounterClockwise 
                size={16} 
                style={{ 
                  animation: refreshingStreams ? 'spin 1s linear infinite' : 'none',
                  color: 'var(--text-secondary)'
                }} 
              />
            </button>
          </div>

          {activeStreams.length === 0 ? (
            <div 
              style={{ 
                padding: '24px 16px', 
                background: 'var(--bg-surface)', 
                borderRadius: 16, 
                textAlign: 'center', 
                border: '1px solid rgba(255,255,255,0.05)',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem'
              }}
            >
              No custom live streams are currently running in your AWS Account. 
              <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: 4 }}>
                Create a demo stage above to start the first stream!
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeStreams.map((stream) => {
                const isAudio = stream.type === 'AUDIO';
                const Icon = isAudio ? Broadcast : VideoCamera;
                
                return (
                  <div 
                    key={stream.stageArn || stream.hostId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      background: 'var(--bg-surface)',
                      borderRadius: 16,
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.2s ease',
                    }}
                    className="stream-list-card"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: isAudio ? 'rgba(138, 180, 248, 0.1)' : 'rgba(129, 201, 149, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isAudio ? '#8ab4f8' : '#81c795',
                      }}>
                        <Icon size={20} weight="fill" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {stream.hostAttributes?.username || 'Host'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: 6, marginTop: 2 }}>
                          <span>{isAudio ? 'Audio Room' : 'Video Stage'}</span>
                          <span>•</span>
                          <span>Started {getFormatTime(stream.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleJoinActiveStream(stream)}
                      style={{
                        padding: '8px 18px',
                        background: '#3080f8',
                        border: 'none',
                        borderRadius: 20,
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(48, 128, 248, 0.3)',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {isAudio ? 'Listen' : 'Join'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .live-indicator-pulse {
          width: 8px;
          height: 8px;
          background-color: #0f9d58;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 0 0 rgba(15, 157, 88, 0.7);
          animation: pulse 1.6s infinite cubic-bezier(0.66, 0, 0, 1);
        }
        @keyframes pulse {
          to {
            box-shadow: 0 0 0 10px rgba(15, 157, 88, 0);
          }
        }
        .stream-list-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.1) !important;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
