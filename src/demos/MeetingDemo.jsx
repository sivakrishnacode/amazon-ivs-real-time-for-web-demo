import React, { useEffect, useState } from 'react';
import { useStageStore } from '../stores/useStageStore.js';
import { useUsernameStore } from '../stores/useUsernameStore.js';
import GridStage from '../components/stage/GridStage.jsx';
import ControlBar from '../components/ui/ControlBar.jsx';
import ChatMessages from '../components/ui/ChatMessages.jsx';
import { Info, Copy, Check, X } from '@phosphor-icons/react';

export default function MeetingDemo() {
  const { stageJoined, leaveStage, toggleMic, toggleCam, micEnabled, camEnabled } = useStageStore();
  const { userId } = useUsernameStore();
  
  const [showDetails, setShowDetails] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      leaveStage();
    };
  }, []);

  // Determine host ID for sharing
  const params = new URLSearchParams(window.location.search);
  const sharedHostId = params.get('hostId');
  const targetHostId = sharedHostId || userId || 'siva-user-id';
  
  // Create shareable join link
  const shareLink = `${window.location.origin}/demos?hostId=${targetHostId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0 }}>
        {/* Responsive Grid View */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <GridStage />
          
          {/* Floating Meet Info Toggle Button (Gmeet Bottom Left) */}
          <button 
            onClick={() => setShowDetails(!showDetails)}
            style={{
              position: 'absolute',
              bottom: 24,
              left: 24,
              zIndex: 100,
              background: 'rgba(32, 33, 36, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px',
              padding: '10px 20px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              fontFamily: 'inherit',
              fontWeight: 500,
              fontSize: '0.85rem',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(60, 64, 67, 0.9)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(32, 33, 36, 0.9)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Info size={18} weight="bold" />
            Meeting details
          </button>

          {/* Gmeet Meeting Details Popover Card */}
          {showDetails && (
            <div
              style={{
                position: 'absolute',
                bottom: 84,
                left: 24,
                zIndex: 101,
                width: 340,
                background: 'rgba(32, 33, 36, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '16px',
                padding: '24px',
                color: '#ffffff',
                boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(20px)',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500, letterSpacing: '-0.3px' }}>Your meeting is ready</h3>
                <button 
                  onClick={() => setShowDetails(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    display: 'flex',
                    padding: 4,
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <p style={{ margin: 0, fontSize: '0.85rem', color: '#e8eaed', lineHeight: '1.4' }}>
                Share this link with others to invite them to join the meeting:
              </p>

              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10, 
                  background: '#202124', 
                  padding: '12px 14px', 
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <span 
                  style={{ 
                    flex: 1, 
                    fontSize: '0.8rem', 
                    color: '#8ab4f8', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    userSelect: 'all',
                  }}
                >
                  {shareLink}
                </span>
                <button
                  onClick={handleCopyLink}
                  style={{
                    background: copied ? '#0f9d58' : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: 8,
                    cursor: 'pointer',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {copied ? <Check size={16} weight="bold" /> : <Copy size={16} />}
                </button>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: '1.3' }}>
                Anyone who has this link can open it in their browser and instantly join your interactive live stream.
              </div>
            </div>
          )}
        </div>

        {/* Chat overlap/bottom view */}
        <div style={{ height: 160, width: '100%', overflow: 'hidden' }}>
          <ChatMessages demoMode={true} />
        </div>

        {/* Google Meet control bar */}
        <ControlBar
          isJoined={stageJoined}
          micEnabled={micEnabled}
          camEnabled={camEnabled}
          showChat={true}
          onToggleMic={toggleMic}
          onToggleCam={toggleCam}
          onLeave={leaveStage}
          onJoin={() => {}}
          joinLabel=""
        />
      </div>

      {/* Slide Up Keyframes styling */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
