import React, { useState, useEffect } from 'react';
import { useUsernameStore } from '../stores/useUsernameStore.js';
import { useStageStore } from '../stores/useStageStore.js';
import { StageEvents, StreamType } from 'amazon-ivs-web-broadcast';
import ParticipantVideo from '../components/stage/ParticipantVideo.jsx';
import CometEye from '../components/stage/CometEye.jsx';
import ChatMessages from '../components/ui/ChatMessages.jsx';
import ControlBar from '../components/ui/ControlBar.jsx';
import { ShootingStar, Trophy } from '@phosphor-icons/react';
import confetti from 'canvas-confetti';

const AWS_COLORS = {
  rose: ['#ec4899', '#f43f5e', '#e11d48'],
  indigo: ['#6366f1', '#4f46e5', '#4338ca'],
};

export default function PKModeDemo() {
  const username = useUsernameStore((s) => s.username);
  const { stageJoined, getStage, connectToStage, leaveStage } = useStageStore();

  const [redProgress, setRedProgress] = useState(50);
  const [timer, setTimer] = useState(300);
  const [lastVote, setLastVote] = useState(null);

  const [userPosition, setUserPosition] = useState(null);
  const [leftParticipant, setLeftParticipant] = useState(null);
  const [rightParticipant, setRightParticipant] = useState(null);

  const [localVideoStream, setLocalVideoStream] = useState(null);
  const [leftRemoteParticipant, setLeftRemoteParticipant] = useState(null);
  const [rightRemoteParticipant, setRightRemoteParticipant] = useState(null);

  const isLeftPublisher = (participant) => participant.userId === 'dealer-0';
  const isRightPublisher = (participant) => participant.userId === 'dealer-1';

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const spawnConfetti = (position) => {
    let x = 0;
    let colors = AWS_COLORS.rose;
    let spread = 45;
    if (position === 'right') {
      x = 1;
      colors = AWS_COLORS.indigo;
      spread = -45;
    }

    confetti({
      colors,
      particleCount: 20,
      startVelocity: 40,
      spread,
      angle: 90,
      ticks: 50,
      shapes: ['star', 'circle'],
      origin: {
        x,
        y: Math.random() * (0.7 - 0.5) + 0.5,
      },
    });
  };

  const handleVote = (position) => {
    setLastVote(position);
    spawnConfetti(position);
    if (position === 'left') {
      setRedProgress((prev) => Math.min(100, prev + 2.5));
    } else {
      setRedProgress((prev) => Math.max(0, prev - 2.5));
    }
  };

  const getLocalVideoStream = async () => {
    return navigator.mediaDevices.getUserMedia({ video: true, facingMode: 'user' });
  };

  const releaseLocalVideo = () => {
    if (localVideoStream) {
      localVideoStream.getTracks().forEach((track) => track.stop());
      setLocalVideoStream(null);
    }
  };

  const joinSlot = async (slot = 'right') => {
    try {
      const stream = await getLocalVideoStream();
      setLocalVideoStream(stream);
      if (slot === 'left') {
        setLeftParticipant({ videoStream: stream });
        setUserPosition('left');
      } else {
        setRightParticipant({ videoStream: stream });
        setUserPosition('right');
      }
    } catch (err) {
      console.error('Failed to join PK Slot:', err);
    }
  };

  const leaveSlot = () => {
    setLastVote(null);
    if (userPosition === 'left') {
      setLeftParticipant(leftRemoteParticipant);
    } else {
      setRightParticipant(rightRemoteParticipant);
    }
    releaseLocalVideo();
    setUserPosition(null);
  };

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setRedProgress((prev) => {
        const delta = (Math.random() - 0.5) * 4;
        return Math.max(5, Math.min(95, prev + delta));
      });
    }, 1200);

    const timerInterval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(timerInterval);
    };
  }, []);

  useEffect(() => {
    const stage = getStage();
    if (!stage) return;

    const onParticipantStreamsAdded = (participant, streams) => {
      streams.forEach((stream) => {
        if (stream.streamType !== StreamType.VIDEO) return;
        const mediaStream = new MediaStream([stream.mediaStreamTrack]);
        const updatedParticipant = { ...participant, videoStream: mediaStream };

        if (isLeftPublisher(participant)) {
          setLeftRemoteParticipant(updatedParticipant);
          setLeftParticipant(updatedParticipant);
        } else if (isRightPublisher(participant)) {
          setRightRemoteParticipant(updatedParticipant);
          setRightParticipant(updatedParticipant);
        }
      });
    };

    stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, onParticipantStreamsAdded);

    return () => {
      stage.off(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, onParticipantStreamsAdded);
    };
  }, [getStage()]);

  useEffect(() => {
    return () => {
      releaseLocalVideo();
      leaveStage();
    };
  }, []);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div className="pk-demo" style={{ flex: 1, minWidth: 0, padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
        
        {/* PK Progress Bar */}
        <div style={{ position: 'relative', width: '100%', height: 24, background: 'var(--bg-surface)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
            <div
              style={{
                width: `${redProgress}%`,
                background: 'linear-gradient(to right, var(--red) 0%, #ff5252 100%)',
                height: '100%',
                transition: 'width 0.4s ease',
              }}
            />
            <div
              style={{
                width: `${100 - redProgress}%`,
                background: 'linear-gradient(to left, var(--blue) 0%, #40a0ff 100%)',
                height: '100%',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${redProgress}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'left 0.4s ease',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            <CometEye style={{ width: 24, height: 24, color: lastVote === 'right' ? 'var(--blue)' : 'var(--red)' }} />
          </div>
        </div>

        {/* Video Splits */}
        <div style={{ flex: 1, display: 'flex', gap: 8, minHeight: 0 }}>
          <div style={{ flex: 1, position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#000' }}>
            {leftParticipant && leftParticipant.videoStream ? (
              <ParticipantVideo stream={leftParticipant.videoStream} isLocal={userPosition === 'left'} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                <Trophy size={48} weight="duotone" />
                <span style={{ fontSize: '0.9rem', marginTop: 8 }}>Left Challenger</span>
              </div>
            )}
          </div>

          <div style={{ flex: 1, position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#000' }}>
            {rightParticipant && rightParticipant.videoStream ? (
              <ParticipantVideo stream={rightParticipant.videoStream} isLocal={userPosition === 'right'} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                <button
                  onClick={() => joinSlot('right')}
                  className="btn-primary"
                  style={{ gap: 8 }}
                >
                  Join Battle
                </button>
              </div>
            )}
          </div>

          {/* Centered Timer Overlay */}
          <div
            style={{
              position: 'absolute',
              top: 50,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.65)',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: '0.9rem',
              fontWeight: 'bold',
              fontFamily: 'monospace',
              zIndex: 10,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {formatTime(timer)}
          </div>
        </div>

        {/* Voting Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn-primary"
            onClick={() => handleVote('left')}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, var(--red) 0%, #b31414 100%)',
              boxShadow: 'none',
              borderRadius: 8,
              justifyContent: 'center',
            }}
          >
            <ShootingStar size={20} weight="fill" />
            Vote Red
          </button>

          <button
            className="btn-primary"
            onClick={() => handleVote('right')}
            style={{
              flex: 1,
              background: 'linear-gradient(135deg, var(--blue) 0%, #1557b0 100%)',
              boxShadow: 'none',
              borderRadius: 8,
              justifyContent: 'center',
            }}
          >
            Vote Blue
            <ShootingStar size={20} weight="fill" style={{ transform: 'scaleX(-1)' }} />
          </button>
        </div>

        {/* Chat Messaging */}
        <div style={{ height: 160, width: '100%', overflow: 'hidden' }}>
          <ChatMessages demoMode={true} />
        </div>

        <ControlBar
          isJoined={!!userPosition}
          micEnabled={true}
          camEnabled={true}
          showChat={false}
          onToggleMic={() => {}}
          onToggleCam={() => {}}
          onLeave={leaveSlot}
          onJoin={() => joinSlot('right')}
          joinLabel="Join Battle"
        />
      </div>
    </div>
  );
}
