import React from 'react';
import ParticipantVideo from './ParticipantVideo.jsx';
import ParticipantAudio from './ParticipantAudio.jsx';
import UserAvatar from '../ui/UserAvatar.jsx';

export default function ParticipantTile({ participant }) {
  const username = participant.attributes?.username || participant.userId;
  const isLocal = participant.isLocal;
  const hasVideo = !!participant.videoStream;
  const hasAudio = !!participant.audioStream;

  return (
    <div className={`participant-card${participant.isSpeaking ? ' speaking' : ''}`}>
      {hasVideo ? (
        <ParticipantVideo stream={participant.videoStream} isLocal={isLocal} />
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <UserAvatar username={username} />
        </div>
      )}

      {hasAudio && !isLocal && <ParticipantAudio stream={participant.audioStream} />}

      <div className="participant-card-overlay">
        {username} {isLocal && '(You)'}
      </div>
    </div>
  );
}
