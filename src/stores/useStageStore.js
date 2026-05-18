/**
 * useStageStore.js — Complete rewrite
 * Fixes: real media publishing, StageEvents wired, toggleMic/Cam functional,
 *        participants map always in sync, localParticipant always populated.
 */
import { create } from 'zustand';
import {
  Stage,
  LocalStageStream,
  StageEvents,
  StageConnectionState,
  SubscribeType,
  StreamType,
} from 'amazon-ivs-web-broadcast';

// SDK objects live at module scope — never in React state/proxies
let _stage = null;
let _localVideoStream = null;
let _localAudioStream = null;
let _publishedVideoTrack = null;
let _publishedAudioTrack = null;

function makeParticipant(info) {
  return {
    id: info.id,
    userId: info.userId,
    attributes: info.attributes || {},
    isLocal: info.isLocal,
    isPublishing: info.isPublishing ?? false,
    videoStream: null,
    audioStream: null,
    isSpeaking: false,
    videoMuted: false,
    audioMuted: false,
  };
}

export const useStageStore = create((set, get) => ({
  stageJoined: false,
  stageCreated: false,
  stageState: StageConnectionState.DISCONNECTED,
  participantsMap: {},
  localParticipant: null,
  micEnabled: true,
  camEnabled: true,

  getStage: () => _stage,

  // ── Derived list for rendering ──────────────────────────────────────────────
  getParticipants: () => Object.values(get().participantsMap),

  // ── connectToStage ──────────────────────────────────────────────────────────
  connectToStage: async (token) => {
    if (_stage) await get().leaveStage();

    set({ stageCreated: true });

    // Acquire camera and mic separately so one failure doesn't block the other
    try {
      _localVideoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (e) {
      console.warn('Camera not available:', e.message);
    }
    try {
      _localAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (e) {
      console.warn('Microphone not available:', e.message);
    }

    const videoTrack = _localVideoStream?.getVideoTracks()[0];
    const audioTrack = _localAudioStream?.getAudioTracks()[0];

    _publishedVideoTrack = videoTrack ? new LocalStageStream(videoTrack) : null;
    _publishedAudioTrack = audioTrack ? new LocalStageStream(audioTrack) : null;

    const { micEnabled, camEnabled } = get();
    _publishedVideoTrack?.setMuted(!camEnabled);
    _publishedAudioTrack?.setMuted(!micEnabled);

    const strategy = {
      stageStreamsToPublish() {
        const out = [];
        if (_publishedVideoTrack) out.push(_publishedVideoTrack);
        if (_publishedAudioTrack) out.push(_publishedAudioTrack);
        return out;
      },
      shouldPublishParticipant(info) {
        if (!info.isLocal) return false;
        return !!(_publishedVideoTrack || _publishedAudioTrack);
      },
      shouldSubscribeToParticipant(info) {
        return info.isLocal ? SubscribeType.NONE : SubscribeType.AUDIO_VIDEO;
      },
    };

    let stageInstance;
    try {
      stageInstance = new Stage(token, strategy);
      _stage = stageInstance;
    } catch (err) {
      set({ stageCreated: false });
      _localVideoStream?.getTracks().forEach((t) => t.stop());
      _localAudioStream?.getTracks().forEach((t) => t.stop());
      throw err;
    }

    // ── Event: connection state ────────────────────────────────────────────────
    stageInstance.on(StageEvents.STAGE_CONNECTION_STATE_CHANGED, (state) => {
      set({ stageState: state });
      if (state === StageConnectionState.CONNECTED) set({ stageJoined: true });
      if (state === StageConnectionState.DISCONNECTED) set({ stageJoined: false });
    });

    // ── Event: participant joined ──────────────────────────────────────────────
    stageInstance.on(StageEvents.STAGE_PARTICIPANT_JOINED, (info) => {
      const p = makeParticipant(info);
      if (info.isLocal) {
        // Build preview MediaStreams for the local tile
        const vid = _localVideoStream
          ? new MediaStream(_localVideoStream.getVideoTracks())
          : null;
        const aud = _localAudioStream
          ? new MediaStream(_localAudioStream.getAudioTracks())
          : null;
        set({ localParticipant: { ...p, videoStream: vid, audioStream: aud } });
      } else {
        set((s) => ({ participantsMap: { ...s.participantsMap, [p.id]: p } }));
      }
    });

    // ── Event: participant left ────────────────────────────────────────────────
    stageInstance.on(StageEvents.STAGE_PARTICIPANT_LEFT, (info) => {
      if (info.isLocal) {
        set({ localParticipant: null });
        return;
      }
      set((s) => {
        const next = { ...s.participantsMap };
        delete next[info.id];
        return { participantsMap: next };
      });
    });

    // ── Event: streams added ───────────────────────────────────────────────────
    stageInstance.on(StageEvents.STAGE_PARTICIPANT_STREAMS_ADDED, (info, streams) => {
      if (info.isLocal) return;
      set((s) => {
        const existing = s.participantsMap[info.id] || makeParticipant(info);
        let { videoStream, audioStream } = existing;
        streams.forEach((stream) => {
          const ms = new MediaStream([stream.mediaStreamTrack]);
          if (stream.streamType === StreamType.VIDEO) videoStream = ms;
          else if (stream.streamType === StreamType.AUDIO) audioStream = ms;
        });
        return {
          participantsMap: {
            ...s.participantsMap,
            [info.id]: { ...existing, videoStream, audioStream, isPublishing: true },
          },
        };
      });
    });

    // ── Event: streams removed ────────────────────────────────────────────────
    stageInstance.on(StageEvents.STAGE_PARTICIPANT_STREAMS_REMOVED, (info, streams) => {
      if (info.isLocal) return;
      set((s) => {
        const existing = s.participantsMap[info.id];
        if (!existing) return {};
        let { videoStream, audioStream } = existing;
        streams.forEach((stream) => {
          if (stream.streamType === StreamType.VIDEO) videoStream = null;
          if (stream.streamType === StreamType.AUDIO) audioStream = null;
        });
        return {
          participantsMap: {
            ...s.participantsMap,
            [info.id]: { ...existing, videoStream, audioStream },
          },
        };
      });
    });

    // ── Event: stream mute changed ────────────────────────────────────────────
    stageInstance.on(StageEvents.STAGE_STREAM_MUTE_CHANGED, (info, stream) => {
      if (info.isLocal) return;
      set((s) => {
        const existing = s.participantsMap[info.id];
        if (!existing) return {};
        return {
          participantsMap: {
            ...s.participantsMap,
            [info.id]: {
              ...existing,
              videoMuted: stream.streamType === StreamType.VIDEO ? stream.isMuted : existing.videoMuted,
              audioMuted: stream.streamType === StreamType.AUDIO ? stream.isMuted : existing.audioMuted,
            },
          },
        };
      });
    });

    try {
      await stageInstance.join();
    } catch (err) {
      _stage = null;
      set({ stageCreated: false });
      throw err;
    }
  },

  // ── leaveStage ──────────────────────────────────────────────────────────────
  leaveStage: async () => {
    if (_stage) {
      try { _stage.removeAllListeners(); } catch (_) {}
      try { await _stage.leave(); } catch (_) {}
      _stage = null;
    }
    _localVideoStream?.getTracks().forEach((t) => t.stop());
    _localAudioStream?.getTracks().forEach((t) => t.stop());
    _localVideoStream = null;
    _localAudioStream = null;
    _publishedVideoTrack = null;
    _publishedAudioTrack = null;

    set({
      stageJoined: false,
      stageCreated: false,
      stageState: StageConnectionState.DISCONNECTED,
      participantsMap: {},
      localParticipant: null,
      micEnabled: true,
      camEnabled: true,
    });
  },

  // ── toggleMic ───────────────────────────────────────────────────────────────
  toggleMic: () => {
    const next = !get().micEnabled;
    set({ micEnabled: next });
    _publishedAudioTrack?.setMuted(!next);
    _localAudioStream?.getAudioTracks().forEach((t) => { t.enabled = next; });
    _stage?.refreshStrategy();
    set((s) => ({
      localParticipant: s.localParticipant
        ? { ...s.localParticipant, audioMuted: !next }
        : null,
    }));
  },

  // ── toggleCam ───────────────────────────────────────────────────────────────
  toggleCam: () => {
    const next = !get().camEnabled;
    set({ camEnabled: next });
    _publishedVideoTrack?.setMuted(!next);
    _localVideoStream?.getVideoTracks().forEach((t) => { t.enabled = next; });
    _stage?.refreshStrategy();
    set((s) => ({
      localParticipant: s.localParticipant
        ? { ...s.localParticipant, videoMuted: !next }
        : null,
    }));
  },
}));
