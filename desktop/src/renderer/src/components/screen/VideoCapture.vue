<template>
  <div class="remote">
    <Header v-if="!isFullscreen" window-id="remote" />
    <div class="video">
      <video ref="video" autoplay="autoplay" playsinline></video>
      <a-button class="fullscreen-btn" shape="circle" icon="fullscreen" @click="toggleFullscreen" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import { Message } from '@arco-design/web-vue'
import Header from '../Header.vue'
import { getDesktopSources } from '../../utils/screen'
import { getPlatform } from '../../utils/permission'

// eslint-disable-next-line vue/require-prop-types
const stream = defineModel('stream', { default: undefined })

const videoRef = useTemplateRef('video')
const isFullscreen = ref(false)

// 启动录屏
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const startRecord = async () => {
  const isLinux = (await getPlatform()) === 'Linux'
  try {
    if (isLinux) {
      const sources = await getDesktopSources({ types: ['screen'] })
      const selectedSource = sources[0]
      stream.value = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: selectedSource.id,
            // minWidth: 1280,
            minWidth: 1960,
            maxWidth: 3840,
            // minHeight: 720,
            minHeight: 1080,
            maxHeight: 2160
          }
        }
      })
      handleStream(stream.value)
    } else {
      stream.value = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })
      handleStream(stream.value)
    }
  } catch (err: never) {
    Message.error(err.message)
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleStream = (stream: MediaStream) => {
  if (videoRef.value) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    videoRef.value.srcObject = stream
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    videoRef.value.onloadedmetadata = () => videoRef.value.play()
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
