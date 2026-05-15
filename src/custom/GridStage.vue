<template>
  <div class="grow min-h-0 w-full overflow-y-auto custom-scrollbar pt-4">
    <div :class="['grid gap-4 w-full items-center justify-center content-start px-4 pb-20', gridClass]">
      <div v-for="participant in allParticipants" :key="participant.id" 
        class="relative bg-surfaceAlt3 rounded-2xl overflow-hidden aspect-video shadow-2xl w-full flex items-center justify-center border border-white/5 group hover:border-white/20 transition-all duration-300">
        <ParticipantVideo 
          :video-stream="participant.videoStream" 
          :is-local="participant.isLocal" 
          class="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700" 
        />
        <ParticipantAudio v-if="!participant.isLocal" :audio-stream="participant.audioStream" />
        <div class="absolute bottom-4 left-4 px-4 py-1.5 bg-black/60 backdrop-blur-md text-white rounded-full text-sm font-semibold border border-white/10 shadow-lg translate-y-0 group-hover:-translate-y-1 transition-transform">
          <div class="flex items-center gap-2">
            <div v-if="participant.isLocal" class="size-2 bg-secondary rounded-full animate-pulse"></div>
            {{ participant.username }}
          </div>
        </div>
      </div>

      <!-- Empty state if alone -->
      <div v-if="allParticipants.length === 0" class="col-span-full flex flex-col items-center justify-center text-uiText/50 gap-6 py-32">
         <div class="size-32 rounded-full bg-surfaceAlt2/10 flex items-center justify-center border border-white/5 shadow-inner">
            <PhVideoConference :size="64" weight="duotone" class="text-secondary opacity-80" />
         </div>
         <div class="text-center">
            <p class="text-2xl font-bold text-uiText">No one is on stage</p>
            <p class="text-uiTextAlt2 mt-2">Join the stage to start the meeting</p>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStageStore } from '../stores/stage';
import { useUsernameStore } from '../stores/usernameStore';
import { StreamType } from 'amazon-ivs-web-broadcast';
import ParticipantVideo from '../components/ParticipantVideo.vue';
import ParticipantAudio from '../components/ParticipantAudio.vue';
import { PhVideoConference } from '@phosphor-icons/vue';

const stageStore = useStageStore();
const usernameStore = useUsernameStore();

const allParticipants = computed(() => {
  const list = [];
  
  // Local participant
  if (stageStore.localParticipant && stageStore.onStage) {
    const videoStream = stageStore.localStreams.find(s => s.streamType === StreamType.VIDEO);
    list.push({
      id: 'local',
      isLocal: true,
      username: usernameStore.username + ' (You)',
      videoStream: videoStream?.mediaStreamTrack ? new MediaStream([videoStream.mediaStreamTrack]) : null,
      audioStream: null
    });
  }

  // Remote participants
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
  if (count <= 1) return 'grid-cols-1 max-w-4xl mx-auto';
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (count <= 4) return 'grid-cols-2';
  if (count <= 6) return 'grid-cols-2 lg:grid-cols-3';
  return 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4';
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>
