/**
 * ControlBar.jsx — Google Meet style floating control bar
 * Now shows mic/cam state correctly, with tooltips.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Microphone, MicrophoneSlash,
  VideoCamera, VideoCameraSlash,
  PhoneDisconnect,
  Chat,
} from '@phosphor-icons/react';

export default function ControlBar({
  isJoined,
  micEnabled,
  camEnabled,
  onToggleMic,
  onToggleCam,
  onLeave,
  onJoin,
  joinLabel,
  extraButtons,
}) {
  const navigate = useNavigate();

  const handleDisconnect = () => {
    if (onLeave) onLeave();
    navigate('/demos');
  };

  return (
    <div className="control-bar">
      {onToggleMic && (
        <button
          className={`control-btn${micEnabled ? ' active' : ''}`}
          onClick={onToggleMic}
          title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
          aria-label={micEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {micEnabled
            ? <Microphone size={20} weight="bold" />
            : <MicrophoneSlash size={20} weight="bold" />}
        </button>
      )}

      {onToggleCam && (
        <button
          className={`control-btn${camEnabled ? ' active' : ''}`}
          onClick={onToggleCam}
          title={camEnabled ? 'Turn off camera' : 'Turn on camera'}
          aria-label={camEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {camEnabled
            ? <VideoCamera size={20} weight="bold" />
            : <VideoCameraSlash size={20} weight="bold" />}
        </button>
      )}

      {/* Slot for extra demo-specific buttons */}
      {extraButtons}

      {isJoined ? (
        <button
          className="control-btn danger"
          onClick={handleDisconnect}
          title="Leave meeting"
          aria-label="Leave meeting"
        >
          <PhoneDisconnect size={20} weight="bold" />
        </button>
      ) : (
        onJoin && (
          <button
            onClick={onJoin}
            className="btn-primary"
            style={{
              padding: '0 24px',
              height: 44,
              fontSize: '0.9rem',
              borderRadius: 22,
              boxShadow: 'none',
              width: 'auto',
            }}
          >
            {joinLabel || 'Join Stage'}
          </button>
        )
      )}
    </div>
  );
}
