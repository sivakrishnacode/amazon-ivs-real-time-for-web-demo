import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Microphone, MicrophoneSlash, VideoCamera, VideoCameraSlash, PhoneDisconnect } from '@phosphor-icons/react';

export default function ControlBar({
  isJoined,
  micEnabled,
  camEnabled,
  showChat,
  onToggleMic,
  onToggleCam,
  onLeave,
  onJoin,
  joinLabel,
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
          aria-label={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {micEnabled ? <Microphone size={20} weight="bold" /> : <MicrophoneSlash size={20} weight="bold" />}
        </button>
      )}

      {onToggleCam && (
        <button
          className={`control-btn${camEnabled ? ' active' : ''}`}
          onClick={onToggleCam}
          aria-label={camEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
        >
          {camEnabled ? <VideoCamera size={20} weight="bold" /> : <VideoCameraSlash size={20} weight="bold" />}
        </button>
      )}

      {isJoined ? (
        <button className="control-btn danger" onClick={handleDisconnect} aria-label="Leave Stage">
          <PhoneDisconnect size={20} weight="bold" />
        </button>
      ) : (
        onJoin && (
          <button
            onClick={onJoin}
            className="btn-primary"
            style={{
              padding: '0 20px',
              height: 44,
              fontSize: '0.9rem',
              borderRadius: 22,
              boxShadow: 'none',
            }}
          >
            {joinLabel || 'Join Stage'}
          </button>
        )
      )}
    </div>
  );
}
