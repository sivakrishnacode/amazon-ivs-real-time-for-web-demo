import React, { useState, useEffect } from 'react';
import { useUsernameStore } from '../stores/useUsernameStore.js';
import { useStageStore } from '../stores/useStageStore.js';
import { StageEvents, StreamType } from 'amazon-ivs-web-broadcast';
import ParticipantVideo from '../components/stage/ParticipantVideo.jsx';
import ParticipantAudio from '../components/stage/ParticipantAudio.jsx';
import VideoStatic from '../components/stage/VideoStatic.jsx';
import ChatMessages from '../components/ui/ChatMessages.jsx';
import ControlBar from '../components/ui/ControlBar.jsx';
import { UserSquare } from '@phosphor-icons/react';

export default function GuestSpotDemo() {
  const username = useUsernameStore((s) => s.username);
  const { stageJoined, getStage, connectToStage, leaveStage } = useStageStore();

  const [inGuestSpot, setInGuestSpot] = useState(false);
  const [localPublisherVideoStream, setLocalPublisherVideoStream] = useState(null);

  const [mainPublisher, setMainPublisher] = useState(null);
  const [mainPublisherVideoStream, setMainPublisherVideoStream] = useState(null);
  const [mainPublisherAudioStream, setMainPublisherAudioStream] = useState(null);

  const [guestPublisher, setGuestPublisher] = useState(null);
  const [guestPublisherVideoStream, setGuestPublisherVideoStream] = useState(null);
  const [guestPublisherAudioStream, setGuestPublisherAudioStream] = useState(null);

  const isMainPublisher = (participant) => participant.userId === 'dealer-0';
  const isGuestPublisher = (participant) => participant.userId === 'dealer-1';

  const releaseLocalVideo = () => {
    if (localPublisherVideoStream) {
      localPublisherVideoStream.getTracks().forEach((track) => track.stop());
      setLocalPublisherVideoStream(null);
    }
  };

  const joinGuestSlot = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, facingMode: 'user' });
      setLocalPublisherVideoStream(videoStream);
      setInGuestSpot(true);
    } catch (err) {
      console.error('Failed to access camera for guest spot:', err);
    }
  };

  const leaveGuestSlot = () => {
    releaseLocalVideo();
    setInGuestSpot(false);
  };

  useEffect(() => {
    const stage = getStage();
    if (!stage) return;

    const onParticipantStreamsRemoved = (participant) => {
      if (isMainPublisher(participant)) {
        setMainPublisher(null);
        setMainPublisherAudioStream(null);
        setMainPublisherVideoStream(null);
      } else if (isGuestPublisher(participant)) {
        setGuestPublisher(null);
        setGuestPublisherAudioStream(null);
        setGuestPublisherVideoStream(null);
      }
    };

    const onParticipantStreamsAdded = (participant, streams) => {
      if (isMainPublisher(participant)) {
        setMainPublisher(participant);
        streams.forEach((stream) => {
          if (stream.streamType === StreamType.AUDIO) {
            setMainPublisherAudioStream(new MediaStream([stream.mediaStreamTrack]));
          } else if (stream.streamType === StreamType.VIDEO) {
            setMainPublisherVideoStream(new MediaStream([stream.mediaStreamTrack]));
          }
        });
      } else if (isGuestPublisher(participant)) {
        setGuestPublisher(participant);
        streams.forEach((stream) => {
          if (stream.streamType === StreamType.AUDIO) {
            setGuestPublisherAudioStream(new MediaStream([stream.mediaStreamTrack]));
          } else if (stream.streamType === StreamType.VIDEO) {
            setGuestPublisherVideoStream(new MediaStream([stream.mediaStreamTrack]));
          }
        });
      }
    };

    stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_REMOVED, onParticipantStreamsRemoved);
    stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, onParticipantStreamsAdded);

    return () => {
      stage.off(StageEvents.STAGE_PARTICIPANT_STREAMS_REMOVED, onParticipantStreamsRemoved);
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
      <div className="guest-demo" style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        
        {/* Main Stage View */}
        <div style={{ flex: 1, width: '100%', position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
          {mainPublisher ? (
            <div style={{ width: '100%', height: '100%' }}>
              <ParticipantVideo stream={mainPublisherVideoStream} isLocal={false} />
              {mainPublisherAudioStream && <ParticipantAudio stream={mainPublisherAudioStream} />}
            </div>
          ) : (
            <VideoStatic />
          )}

          {/* Overlay gradient */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          {/* PiP View for Guest Speaker */}
          <div
            className="guest-pip"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 140,
              aspectRatio: '9/16',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '2px solid var(--border)',
              background: '#000',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {inGuestSpot ? (
              <ParticipantVideo stream={localPublisherVideoStream} isLocal={true} />
            ) : guestPublisherVideoStream ? (
              <div style={{ width: '100%', height: '100%' }}>
                <ParticipantVideo stream={guestPublisherVideoStream} isLocal={false} />
                {guestPublisherAudioStream && <ParticipantAudio stream={guestPublisherAudioStream} />}
              </div>
            ) : (
              <button
                onClick={joinGuestSlot}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: 'rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <UserSquare size={32} color="var(--text-secondary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--blue)' }}>Join Spot</span>
              </button>
            )}
          </div>
        </div>

        {/* Chat Component */}
        <div style={{ height: 160, width: '100%', overflow: 'hidden' }}>
          <ChatMessages demoMode={true} />
        </div>

        {/* Controls */}
        <ControlBar
          isJoined={inGuestSpot}
          micEnabled={true}
          camEnabled={true}
          showChat={false}
          onToggleMic={() => {}}
          onToggleCam={() => {}}
          onLeave={leaveGuestSlot}
          onJoin={joinGuestSlot}
          joinLabel="Join Guest Spot"
        />
      </div>
    </div>
  );
}
