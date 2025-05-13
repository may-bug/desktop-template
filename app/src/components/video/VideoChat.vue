<!-- src/components/VideoChat.vue -->
<template>
  <div class="video-chat-container">
    <div class="video-grid">
      <!-- 本地视频 -->
      <div class="video-item">
        <video ref="localVideo" autoplay muted playsinline></video>
        <div class="video-label">You ({{ userId }})</div>
      </div>

      <!-- 远程视频 -->
      <div v-for="[peerId] in remoteStreams" :key="peerId" class="video-item">
        <video :ref="(el) => setRemoteVideo(el, peerId)" autoplay playsinline></video>
        <div class="video-label">Peer {{ peerId }}</div>
      </div>
    </div>

    <div class="controls">
      <button :disabled="isInRoom" @click="joinRoom">Join Room</button>
      <button :disabled="!isInRoom" @click="leaveRoom">Leave Room</button>
      <input v-model="roomId" placeholder="Room ID" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useWebRTC } from '../../composables/useWebRTC'
import { useSignalingStore } from '../../stores/signaling'

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

const roomId = ref('default-room')
const localVideo = ref<HTMLVideoElement | null>(null)
const remoteVideos = ref<Record<string, HTMLVideoElement>>({})
const signaling = useSignalingStore()

const { localStream, remoteStreams, initLocalStream, connectToPeer } = useWebRTC(props.userId)

const isInRoom = computed(() => signaling.currentRoom !== null)

// 设置远程视频元素
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const setRemoteVideo = (el: HTMLVideoElement | null, peerId: string) => {
  if (el) {
    remoteVideos.value[peerId] = el
    const stream = remoteStreams.value.get(peerId)
    if (stream) {
      el.srcObject = stream
    }
  }
}

// 加入房间
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const joinRoom = async () => {
  try {
    await signaling.connect()
    await initLocalStream()
    signaling.joinRoom(roomId.value, props.userId)

    if (localVideo.value && localStream.value) {
      localVideo.value.srcObject = localStream.value
    }
  } catch (err) {
    console.error('Error joining room:', err)
  }
}

// 离开房间
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const leaveRoom = () => {
  signaling.leaveRoom()
}

// 监听新peer加入

watch(
    () => signaling.peers.value,
    (newPeers) => {
      newPeers.forEach((peerId) => {
        // eslint-disable-next-line no-undef
        if (!peerConnections.value.has(peerId)) {
          connectToPeer(peerId)
        }
      })
    },
    { deep: true }
)

onMounted(async () => {
  await initLocalStream()
})

onUnmounted(() => {
  if (localStream.value) {
    localStream.value.getTracks().forEach((track) => track.stop())
  }
})
</script>

<style scoped>
.video-chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  flex-grow: 1;
  padding: 1rem;
}

.video-item {
  position: relative;
  background: #222;
  border-radius: 8px;
  overflow: hidden;
}

.video-item video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 0.5rem;
}

.controls {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f5f5f5;
}

button {
  padding: 0.5rem 1rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex-grow: 1;
}
</style>
