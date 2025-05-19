<template>
  <div class="remote">
    <Header v-if="!isFullscreen" window-id="remote" />
    <div class="video">
      <video ref="video" autoplay="true" playsinline></video>
      <a-button class="fullscreen-btn" shape="circle" icon="fullscreen" @click="toggleFullscreen" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import { Message } from '@arco-design/web-vue'
import Header from '../Header.vue'

const videoRef = useTemplateRef('video')
const isFullscreen = ref(false)

const startRecord = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    })
    handleStream(stream)
  } catch (e: any) {
    console.error(e)
    Message.error(e.message)
  }
}

const handleStream = (stream: MediaStream) => {
  if (videoRef.value) {
    //@ts-ignore
    videoRef.value.srcObject = stream
    //@ts-ignore
    videoRef.value.onloadedmetadata = () => videoRef.value.play()
  }
}

const toggleFullscreen = () => {
  const element = document.documentElement
  if (!document.fullscreenElement) {
    element.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

document.addEventListener('fullscreenchange', () => {
  isFullscreen.value = !!document.fullscreenElement
})

onMounted(() => {
  startRecord()
})
</script>

<style scoped lang="scss">
.video {
  height: calc(100vh - 30px);
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  video {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .fullscreen-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 100;
  }
}
</style>
