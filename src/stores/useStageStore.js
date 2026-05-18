import { create } from 'zustand';
import { Stage, LocalStageStream, StageConnectionState } from 'amazon-ivs-web-broadcast';

let _stage = null;
let _strategy = null;

export const useStageStore = create((set, get) => ({
  stageJoined: false,
  stageState: StageConnectionState.DISCONNECTED,
  participants: [],
  localParticipant: null,
  micEnabled: true,
  camEnabled: true,

  getStage: () => _stage,
  getStrategy: () => _strategy,

  connectToStage: async (token) => {
    if (_stage) {
      await get().leaveStage();
    }

    const { micEnabled, camEnabled } = get();
    const strategy = {
      stageStreamsToPublish() {
        const streams = [];
        // Add local video/audio streams if initialized
        return streams;
      },
      shouldPublishParticipant() {
        return true;
      },
      shouldSubscribeToParticipant() {
        return true;
      },
    };

    _strategy = strategy;
    
    try {
      const stageInstance = new Stage(token, strategy);
      _stage = stageInstance;

      stageInstance.on('connectionStateChanged', (state) => {
        set({ stageState: state });
        if (state === StageConnectionState.CONNECTED) {
          set({ stageJoined: true });
        } else if (state === StageConnectionState.DISCONNECTED) {
          set({ stageJoined: false });
        }
      });

      await stageInstance.join();
    } catch (err) {
      console.error('Stage Connection Failed:', err);
      throw err;
    }
  },

  leaveStage: async () => {
    if (_stage) {
      try {
        await _stage.leave();
      } catch (err) {
        console.error(err);
      }
      _stage = null;
      _strategy = null;
    }
    set({
      stageJoined: false,
      stageState: StageConnectionState.DISCONNECTED,
      participants: [],
      localParticipant: null,
    });
  },

  toggleMic: () => {
    const next = !get().micEnabled;
    set({ micEnabled: next });
    // In production we would mute the local mic stream track
  },

  toggleCam: () => {
    const next = !get().camEnabled;
    set({ camEnabled: next });
    // In production we would mute the local cam stream track
  },
}));
