<template>
  <div class="p-2 grow shrink overflow-hidden">
    <div class="relative w-full h-full max-w-screen-xl mx-auto flex flex-col gap-2">
      <!-- Meeting Grid -->
      <div class="grow min-h-0 w-full">
        <div :class="['grid gap-2 w-full h-full items-center justify-center content-center', gridClass]">
          <div v-for="participant in allParticipants" :key="participant.id" 
            class="relative bg-surfaceAlt3 rounded-xl overflow-hidden aspect-video shadow-lg w-full h-full flex items-center justify-center">
            <ParticipantVideo 
              :video-stream="participant.videoStream" 
              :is-local="participant.isLocal" 
              class="w-full h-full object-cover" 
            />
            <ParticipantAudio v-if="!participant.isLocal" :audio-stream="participant.audioStream" />
            <div class="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/10">
              {{ participant.username }}
            </div>
          </div>

          <!-- Empty state / Call to action if alone -->
          <div v-if="allParticipants.length === 0" class="col-span-full row-span-full flex flex-col items-center justify-center text-uiText/50 gap-4">
             <div class="size-24 rounded-full bg-surfaceAlt3 flex items-center justify-center">
                <PhVideoConference :size="48" weight="duotone" class="text-secondary" />
             </div>
             <p class="text-lg font-medium">Waiting for participants to join...</p>
          </div>
        </div>
      </div>

      <!-- Chat and Controls -->
      <div class="h-1/4 min-h-[150px] flex flex-col gap-2 overflow-hidden">
        <div class="grow overflow-hidden gradient-mask-t-80">
          <ChatMessages v-if="stageStore.stageJoined" />
        </div>
        
        <DemoFooter :username="usernameStore.username" :replace-input="stageStore.onStage">
          <div class="flex gap-2 w-full">
            <MobileButton v-if="!stageStore.onStage" 
              class="grow py-3 rounded-2xl bg-secondary text-white font-bold shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
              @click="handleJoin"
              :disabled="loading"
            >
              <PhVideoCamera weight="bold" :size="20" />
              Join with Video
            </MobileButton>
            <LeaveButton v-else @click="handleLeave" />
          </div>
        </DemoFooter>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUsernameStore } from '../stores/usernameStore';
import { useStageStore } from '../stores/stage';
import { usePopoverStore } from '../stores/popover';
import { StreamType } from 'amazon-ivs-web-broadcast';
import ParticipantVideo from '../components/ParticipantVideo.vue';
import ParticipantAudio from '../components/ParticipantAudio.vue';
import ChatMessages from '../components/ChatMessages.vue';
import DemoFooter from '../components/DemoFooter.vue';
import LeaveButton from '../components/LeaveButton.vue';
import MobileButton from '../components/MobileButton.vue';
import { PhVideoCamera, PhVideoConference } from '@phosphor-icons/vue';

const usernameStore = useUsernameStore();
const stageStore = useStageStore();
const popoverStore = usePopoverStore();
const loading = ref(false);

const allParticipants = computed(() => {
  const list = [];
  
  // Add local participant if publishing
  if (stageStore.localParticipant && stageStore.onStage) {
    const videoStream = stageStore.localStreams.find(s => s.streamType === StreamType.VIDEO);
    list.push({
      id: 'local',
      isLocal: true,
      username: usernameStore.username + ' (You)',
      videoStream: videoStream?.mediaStreamTrack ? new MediaStream([videoStream.mediaStreamTrack]) : null,
      audioStream: null // We don't play local audio
    });
  }

  // Add remote participants
  for (const participant of stageStore.participants.values()) {
    const videoStream = participant.streams.find(s => s.streamType === StreamType.VIDEO);
    const audioStream = participant.streams.find(s => s.streamType === StreamType.AUDIO);
    list.push({
      id: participant.id,
      isLocal: false,
      username: participant.attributes?.username || participant.userId,
      videoStream: videoStream?.mediaStreamTrack ? new MediaStream([videoStream.mediaStreamTrack]) : null,
      audioStream: audioStream?.mediaStreamTrack ? new MediaStream([audioStream.mediaStreamTrack]) : null
    });
  }

  return list;
});

const gridClass = computed(() => {
  const count = allParticipants.value.length;
  if (count <= 1) return 'grid-cols-1 max-w-2xl mx-auto';
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (count <= 4) return 'grid-cols-2';
  if (count <= 6) return 'grid-cols-2 md:grid-cols-3';
  if (count <= 9) return 'grid-cols-3';
  return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
});

const handleJoin = () => {
  popoverStore.getUserPermission(async () => {
    loading.value = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const [videoTrack] = stream.getVideoTracks();
      const [audioTrack] = stream.getAudioTracks();
      
      const vStream = stageStore.createLocalStream(videoTrack);
      const aStream = stageStore.createLocalStream(audioTrack);
      
      stageStore.stageStrategy.updateMedia(aStream, vStream);
      stageStore.stageStrategy.updatePublish(true);
      stageStore.refreshStageStrategy();
      
      stageStore.onStage = true;
    } catch (err) {
      console.error('Failed to join meeting:', err);
    } finally {
      loading.value = false;
    }
  });
};

const handleLeave = () => {
  stageStore.onStage = false;
  stageStore.stageStrategy.updatePublish(false);
  stageStore.stageStrategy.updateMedia(null, null);
  stageStore.refreshStageStrategy();
  stageStore.destroyLocalStreams();
};

onMounted(() => {
    // Stage connection should already be established by List.vue
});

onUnmounted(() => {
  if (stageStore.onStage) {
    handleLeave();
  }
});
</script>

<style scoped>
.aspect-video {
  aspect-ratio: 16 / 9;
}
</style>
