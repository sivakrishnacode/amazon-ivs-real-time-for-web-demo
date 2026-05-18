/**
 * ParticipantTile.jsx
 * Renders a single participant card: video/audio + overlay + mute indicators.
 */
import React from 'react';
import ParticipantVideo from './ParticipantVideo.jsx';
import ParticipantAudio from './ParticipantAudio.jsx';
import UserAvatar from '../ui/UserAvatar.jsx';
import { MicrophoneSlash, VideoCameraSlash } from '@phosphor-icons/react';

export default function ParticipantTile({ participant }) {
  if (!participant) return null;

  const username =
    participant.attributes?.username ||
    participant.userId ||
    'Participant';

  const isLocal = participant.isLocal;
  const hasVideo = !!participant.videoStream && !participant.videoMuted;
  const hasAudio = !!participant.audioStream;
  const videoMuted = participant.videoMuted;
  const audioMuted = participant.audioMuted;
  const isSpeaking = participant.isSpeaking;

  return (
    <div
      className={`participant-card${isSpeaking ? ' speaking' : ''}`}
      style={{ position: 'relative', minHeight: 120 }}
    >
      {/* Video or Avatar fallback */}
      {hasVideo ? (
        <ParticipantVideo stream={participant.videoStream} isLocal={isLocal} />
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)',
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
        }}>
          <UserAvatar username={username} size={72} />
        </div>
      )}

      {/* Audio element (hidden, remote only) */}
      {hasAudio && !isLocal && (
        <ParticipantAudio stream={participant.audioStream} />
      )}

      {/* Name overlay */}
      <div className="participant-card-overlay" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        {audioMuted && (
          <MicrophoneSlash size={12} weight="bold" style={{ color: '#ea4335' }} />
        )}
        <span>{username}{isLocal ? ' (You)' : ''}</span>
      </div>

      {/* Video muted badge */}
      {videoMuted && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'rgba(0,0,0,0.6)',
          borderRadius: 6,
          padding: '4px 6px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: '0.75rem',
          color: '#ea4335',
        }}>
          <VideoCameraSlash size={14} weight="bold" />
        </div>
      )}
    </div>
  );
}
