import React, { useState, useEffect, useRef } from 'react';
import { useUsernameStore } from '../stores/useUsernameStore.js';
import { useStageStore } from '../stores/useStageStore.js';
import { StageEvents, StreamType } from 'amazon-ivs-web-broadcast';
import { createAudioContext, destroyAudioContext, getNormalizedGain } from '../utils/audio.js';
import ParticipantAudio from '../components/stage/ParticipantAudio.jsx';
import UserAvatar from '../components/ui/UserAvatar.jsx';
import ChatMessages from '../components/ui/ChatMessages.jsx';
import ControlBar from '../components/ui/ControlBar.jsx';
import { Plus } from '@phosphor-icons/react';

export default function AudioOnlyDemo() {
  const username = useUsernameStore((s) => s.username);
  const { stageJoined, getStage, connectToStage, leaveStage } = useStageStore();

  const [onStage, setOnStage] = useState(false);
  const [slots, setSlots] = useState([null, null, null, null]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const slotsRef = useRef([null, null, null, null]);

  const localAudioStreamRef = useRef(null);
  const localParticipantSlotIndexRef = useRef(-1);

  // Keep ref up to date
  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  const createLocalParticipant = (name) => ({
    audioStream: null,
    isLocal: true,
    id: name,
    userId: name,
    attributes: { username: name },
  });

  const updateAudioLevel = (index, analyser) => {
    const gain = getNormalizedGain(analyser);
    const slotsArr = slotsRef.current;
    if (!slotsArr[index]) return;

    setSlots((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = {
          ...next[index],
          audioLevel: gain,
          isSpeaking: gain > 0.005,
        };
      }
      return next;
    });

    requestAnimationFrame(() => {
      updateAudioLevel(index, analyser);
    });
  };

  const joinStageSlot = async (slotIndex) => {
    try {
      setSlotsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localAudioStreamRef.current = stream;

      setOnStage(true);
      localParticipantSlotIndexRef.current = slotIndex;

      const newLocalP = createLocalParticipant(username);

      const ctx = createAudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      source.connect(analyser);

      setSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = {
          participant: newLocalP,
          audioStream: null,
          audioCtx: ctx,
          audioLevel: 0,
          isSpeaking: false,
        };
        return next;
      });

      setTimeout(() => {
        updateAudioLevel(slotIndex, analyser);
      }, 50);

    } catch (err) {
      console.error('Failed to join audio slot:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const changePosition = async (currIndex, nextIndex) => {
    setSlotsLoading(true);
    const slotsArr = slotsRef.current;
    const currentSlot = slotsArr[currIndex];
    if (!currentSlot) return;

    if (currentSlot.audioCtx) {
      await destroyAudioContext(currentSlot.audioCtx);
    }

    const stream = localAudioStreamRef.current;
    const ctx = createAudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    source.connect(analyser);

    localParticipantSlotIndexRef.current = nextIndex;

    setSlots((prev) => {
      const next = [...prev];
      const temp = next[nextIndex];
      next[nextIndex] = {
        ...next[currIndex],
        audioCtx: ctx,
        audioLevel: 0,
        isSpeaking: false,
      };
      next[currIndex] = temp;
      return next;
    });

    setTimeout(() => {
      updateAudioLevel(nextIndex, analyser);
    }, 50);

    setSlotsLoading(false);
  };

  const handleGridSelect = (index) => {
    if (slotsLoading) return;
    if (onStage) {
      changePosition(localParticipantSlotIndexRef.current, index);
    } else {
      joinStageSlot(index);
    }
  };

  const leaveSlot = async () => {
    if (onStage) {
      setOnStage(false);
      const index = localParticipantSlotIndexRef.current;
      const slotsArr = slotsRef.current;
      if (index !== -1 && slotsArr[index]) {
        if (slotsArr[index].audioCtx) {
          await destroyAudioContext(slotsArr[index].audioCtx);
        }
        setSlots((prev) => {
          const next = [...prev];
          next[index] = null;
          return next;
        });
      }
      localParticipantSlotIndexRef.current = -1;
      if (localAudioStreamRef.current) {
        localAudioStreamRef.current.getAudioTracks().forEach((track) => track.stop());
        localAudioStreamRef.current = null;
      }
    }
  };

  const getFirstFreeSlot = () => {
    return slotsRef.current.findIndex((elem) => elem === null);
  };

  useEffect(() => {
    const stage = getStage();
    if (!stage) return;

    const onParticipantLeft = (participant) => {
      const slotsArr = slotsRef.current;
      const index = slotsArr.findIndex((p) => p && p.participant && p.participant.id === participant.id);
      if (index !== -1) {
        const slot = slotsArr[index];
        if (slot.audioCtx && slot.audioCtx.state !== 'closed') {
          destroyAudioContext(slot.audioCtx).then(() => {
            setSlots((prev) => {
              const next = [...prev];
              next[index] = null;
              return next;
            });
          });
        } else {
          setSlots((prev) => {
            const next = [...prev];
            next[index] = null;
            return next;
          });
        }
      }
    };

    const onParticipantStreamsAdded = (participant, streams) => {
      if (participant.userId !== 'dealer-0') return;

      streams.forEach((stream) => {
        if (stream.streamType === StreamType.AUDIO) {
          const slotsArr = slotsRef.current;
          const index = slotsArr.findIndex((p) => p && p.participant && p.participant.id === participant.id);
          if (index !== -1) return;

          const freeSlot = getFirstFreeSlot();
          if (freeSlot === -1) return;

          const audioStream = new MediaStream([stream.mediaStreamTrack]);
          const ctx = createAudioContext();
          const source = ctx.createMediaStreamSource(audioStream);
          const analyser = ctx.createAnalyser();
          source.connect(analyser);

          setSlots((prev) => {
            const next = [...prev];
            next[freeSlot] = {
              participant,
              audioStream,
              audioCtx: ctx,
              audioLevel: 0,
              isSpeaking: false,
            };
            return next;
          });

          setTimeout(() => {
            updateAudioLevel(freeSlot, analyser);
          }, 50);
        }
      });
    };

    stage.on(StageEvents.STAGE_PARTICIPANT_LEFT, onParticipantLeft);
    stage.on(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, onParticipantStreamsAdded);

    return () => {
      stage.off(StageEvents.STAGE_PARTICIPANT_LEFT, onParticipantLeft);
      stage.off(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, onParticipantStreamsAdded);
    };
  }, [getStage()]);

  useEffect(() => {
    return () => {
      leaveSlot();
      leaveStage();
    };
  }, []);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <div className="audio-demo" style={{ flex: 1, minWidth: 0 }}>
        {/* Audio Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 16,
          width: '100%',
          flex: 1,
          maxHeight: 500,
        }}>
          {slots.map((slot, index) => {
            if (slot && slot.participant) {
              const name = slot.participant.attributes?.username || slot.participant.userId;
              const scale = 1 + (slot.audioLevel || 0) * 1.5;
              const ringScale = 1 + (slot.audioLevel || 0) * 3;

              return (
                <div
                  key={index}
                  className={`audio-participant-card${slot.isSpeaking ? ' speaking' : ''}`}
                  style={{
                    position: 'relative',
                    aspectRatio: '16/9',
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div
                      className="audio-avatar-ring"
                      style={{
                        position: 'absolute',
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        border: '3px solid var(--green)',
                        transform: `scale(${ringScale})`,
                        opacity: slot.isSpeaking ? 0.6 : 0,
                        transition: 'transform 0.05s linear',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transform: `scale(${scale})`,
                        transition: 'transform 0.05s linear',
                      }}
                    />
                    <UserAvatar username={name} />
                  </div>

                  <span className="audio-participant-name" style={{ marginTop: 12 }}>
                    {name}
                  </span>

                  {slot.audioStream && <ParticipantAudio stream={slot.audioStream} />}
                </div>
              );
            }

            return (
              <button
                key={index}
                onClick={() => handleGridSelect(index)}
                className="audio-participant-card"
                disabled={slotsLoading}
                style={{
                  border: '2px dashed var(--border)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  aspectRatio: '16/9',
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                }}>
                  <Plus size={24} weight="bold" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Chat Component */}
        <div style={{ flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' }}>
          <ChatMessages demoMode={true} />
        </div>

        {/* Bottom controls */}
        <ControlBar
          isJoined={onStage}
          micEnabled={true}
          camEnabled={false}
          showChat={false}
          onToggleMic={() => {}}
          onToggleCam={() => {}}
          onLeave={leaveSlot}
          onJoin={() => handleGridSelect(getFirstFreeSlot())}
          joinLabel="Join Audio Stage"
        />
      </div>
    </div>
  );
}
