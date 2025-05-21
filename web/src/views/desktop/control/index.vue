<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import { useWebRTCWatch } from '../../../hooks/useWebRTCWatch'
import { useDataStore } from '../../../stores/useDataStore'
import {useRoute} from "vue-router";

const route = useRoute()
console.log(route.query.formId, route.query.toId)

const dataStore = useDataStore()
const videoRef = ref<HTMLVideoElement | null>(null)

const webRTCWatch = useWebRTCWatch({
  signalingUrl: 'wss://server.tecgui.cn/ws/signaling',
  token: dataStore.token,
  uid: dataStore.uid,
  deviceId: route.query.formId,
  to:route.query.toId
})

const initEvent=()=>{
  const sendControlMessage = (data: any) => {
    // 通过 WebSocket 发送到后端
    webRTCWatch.sendDataChannelMessage({
      type: 'input',
      payload: data,
    })
  }

  // 键盘事件
  window.addEventListener('keydown', (e) => {
    sendControlMessage({
      event: 'keydown',
      key: e.key,
      code: e.code,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey,
    })
  })

  window.addEventListener('keyup', (e) => {
    sendControlMessage({
      event: 'keyup',
      key: e.key,
      code: e.code,
    })
  })

  // 鼠标移动、点击、滚轮
  const video = videoRef.value
  if (video) {
    video.addEventListener('mousemove', (e) => {
      const rect = video.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      sendControlMessage({
        event: 'mousemove',
        x,
        y,
      })
    })

    video.addEventListener('click', (e) => {
      sendControlMessage({
        event: 'click',
        button: e.button,
      })
    })

    video.addEventListener('wheel', (e) => {
      sendControlMessage({
        event: 'wheel',
        deltaX: e.deltaX,
        deltaY: e.deltaY,
      })
    })
  }
}

onMounted(async () => {
  await webRTCWatch.startWatching()
  initEvent()

  watch(
      () => webRTCWatch.remoteStream.value,
      (newStream) => {
        if (newStream && videoRef.value) {
          videoRef.value.srcObject = newStream
          videoRef.value.play()
        }
      },
      { immediate: true }
  )
})
</script>

<template>
  <div class="container">
    <video ref="videoRef" autoplay playsinline muted></video>
  </div>
</template>

<style lang="scss" scoped>
.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  video{
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}
</style>
