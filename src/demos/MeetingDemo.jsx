/**
 * MeetingDemo.jsx — Google Meet style video conferencing
 *
 * Fixes from original:
 * - Uses stageJoined (not stageCreated) as the source of truth for the UI
 * - Control bar is position:relative, not floating over grid, so it never
 *   occludes tiles on small screens
 * - Meeting details popover is above the control bar, not cut off
 * - Connecting/error states shown clearly
 */
import React, { useEffect, useState } from 'react';
import { useStageStore } from '../stores/useStageStore.js';
import { useUsernameStore } from '../stores/useUsernameStore.js';
import GridStage from '../components/stage/GridStage.jsx';
import ControlBar from '../components/ui/ControlBar.jsx';
import ChatMessages from '../components/ui/ChatMessages.jsx';
import { Info, Copy, Check, X, WifiHigh, WifiSlash } from '@phosphor-icons/react';

export default function MeetingDemo() {
  const {
    stageJoined,
    stageState,
    leaveStage,
    toggleMic,
    toggleCam,
    micEnabled,
    camEnabled,
  } = useStageStore();
  const { userId } = useUsernameStore();

  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Leave stage on unmount
  useEffect(() => () => { leaveStage(); }, []);

  const params = new URLSearchParams(window.location.search);
  const sharedHostId = params.get('hostId');
  const targetHostId = sharedHostId || userId;
  const shareLink = `${window.location.origin}/demos?hostId=${encodeURIComponent(targetHostId)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>

      {/* ── Connection status badge (top center) ───────────────────────────── */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 50, display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(32,33,36,0.85)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: '6px 14px', fontSize: '0.8rem', backdropFilter: 'blur(8px)',
        color: stageJoined ? '#0f9d58' : '#fbbc04',
        pointerEvents: 'none',
      }}>
        {stageJoined
          ? <><WifiHigh size={14} weight="bold" /> Live</>
          : <><WifiSlash size={14} weight="bold" /> {stageState || 'Connecting…'}</>}
      </div>

      {/* ── Video grid ───────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
        <GridStage />

        {/* Meeting details toggle */}
        <button
          onClick={() => setShowDetails((v) => !v)}
          style={{
            position: 'absolute', bottom: 16, left: 16, zIndex: 40,
            background: 'rgba(32,33,36,0.9)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 24, padding: '8px 18px', color: '#fff',
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', backdropFilter: 'blur(10px)',
            fontFamily: 'inherit', fontWeight: 500, fontSize: '0.82rem',
            transition: 'all 0.2s ease',
          }}
        >
          <Info size={16} weight="bold" />
          Meeting details
        </button>

        {/* Meeting details popover */}
        {showDetails && (
          <div style={{
            position: 'absolute', bottom: 60, left: 16, zIndex: 41,
            width: 320, background: 'rgba(32,33,36,0.97)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 16, padding: '20px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
            animation: 'slideUp 0.25s cubic-bezier(0.16,1,0.3,1)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Your meeting is ready</span>
              <button
                onClick={() => setShowDetails(false)}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 4, display: 'flex' }}
              >
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#bdc1c6', marginBottom: 12, lineHeight: 1.4 }}>
              Share this link to invite others to join the meeting:
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#1a1b1e', padding: '10px 12px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{
                flex: 1, fontSize: '0.78rem', color: '#8ab4f8',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                userSelect: 'all',
              }}>
                {shareLink}
              </span>
              <button
                onClick={handleCopyLink}
                style={{
                  background: copied ? '#0f9d58' : 'rgba(255,255,255,0.1)',
                  border: 'none', borderRadius: 6, padding: '6px 8px',
                  cursor: 'pointer', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
              >
                {copied ? <Check size={14} weight="bold" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Chat panel (collapsible) ─────────────────────────────────────────── */}
      {showChat && (
        <div style={{ height: 200, borderTop: '1px solid var(--border)', overflow: 'hidden' }}>
          <ChatMessages demoMode />
        </div>
      )}

      {/* ── Control bar ──────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <ControlBar
          isJoined={stageJoined}
          micEnabled={micEnabled}
          camEnabled={camEnabled}
          onToggleMic={toggleMic}
          onToggleCam={toggleCam}
          onLeave={leaveStage}
        />
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(12px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .control-bar { position: relative; bottom: unset; left: unset; transform: none; margin: 8px auto 12px; }
      `}</style>
    </div>
  );
}
