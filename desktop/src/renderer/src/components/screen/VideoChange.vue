<template>
  <div class="screen-capture">
    <div v-if="!isFullscreen" class="toolbar">
      <a-select v-model="resolutionLabel" style="width: 150px" @change="onResolutionChange">
        <a-option v-for="res in resolutions" :key="res.label" :value="res.label">
          {{ res.label }}
        </a-option>
      </a-select>
      <a-button @click="toggleFullscreen">全屏</a-button>
    </div>
    <div class="video-wrapper">
      <video ref="videoRef" autoplay="autoplay" playsinline></video>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'

const videoRef = ref<HTMLVideoElement | null>(null)
const stream = ref<MediaStream | null>(null)
const isFullscreen = ref(false)

const resolutions = [
  { label: '720p', width: 1280, height: 720 },
  { label: '1080p', width: 1920, height: 1080 },
  { label: '2K', width: 2560, height: 1440 }
]
const resolutionLabel = ref('1080p')

const getSelectedResolution = () => {
  return resolutions.find((r) => r.label === resolutionLabel.value)!
}

const startCapture = async () => {
  try {
    const res = getSelectedResolution()
    stream.value = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: { ideal: res.width },
        height: { ideal: res.height },
        frameRate: { ideal: 30 }
      },
      audio: false
    })

    const videoTrack = stream.value.getVideoTracks()[0]
    await videoTrack.applyConstraints({
      width: { ideal: res.width },
      height: { ideal: res.height }
    })

    if (videoRef.value) {
      videoRef.value.srcObject = stream.value
    }
  } catch (err: any) {
    Message.error(err.message || '屏幕采集失败')
  }
}

const onResolutionChange = async () => {
  const videoTrack = stream.value?.getVideoTracks()[0]
  if (videoTrack) {
    const res = getSelectedResolution()
    try {
      await videoTrack.applyConstraints({
        width: { ideal: res.width },
        height: { ideal: res.height }
      })
    } catch (err: any) {
      Message.error('分辨率调整失败：' + err.message)
    }
  }
}

const toggleFullscreen = () => {
  if (!videoRef.value) return

  const container = videoRef.value.parentElement!
  if (!document.fullscreenElement) {
    container.requestFullscreen().then(() => {
      isFullscreen.value = true
    })
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
    })
  }
}

onMounted(() => {
  startCapture()
})
</script>

<style scoped lang="scss">
.screen-capture {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #000;

  .toolbar {
    padding: 10px;
    display: flex;
    gap: 10px;
    background: #fff;
  }

  .video-wrapper {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;

    video {
      max-width: 100%;
      max-height: 100%;
      aspect-ratio: 16 / 9;
      background: #000;
    }
  }
}
</style>
