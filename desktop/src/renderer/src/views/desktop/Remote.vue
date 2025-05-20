<template>
  <VideoCapture :stream="stream" />
</template>

<script setup lang="ts">
import VideoCapture from '../../components/screen/VideoCapture.vue'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useWebRTCShare } from '../../hook/useWebRTCShare'
import { useDataStore } from '../../stores/useDataStore'
const stream = ref()
const dataStore = useDataStore()

console.log(dataStore.token)
const { startSharing, stopSharing, localStream } = useWebRTCShare({
  signalingUrl: 'wss://server.tecgui.cn/ws/signaling',
  token: dataStore.token,
  uid: dataStore.uid,
  deviceId: '1234'
})
onMounted(() => {
  if (stream.value) {
    try {
      console.log(stream.value)
      localStream.value = stream.value
      startSharing()
    } catch (err) {
      console.error(err)
    }
  }
})
watch(
  stream,
  (value) => {
    console.log(value)
    try {
      console.log(stream.value)
      localStream.value = stream.value
      startSharing()
    } catch (err) {
      console.error(err)
    }
  },
  {
    immediate: true,
    deep: true
  }
)
onUnmounted(stopSharing)
</script>
<style></style>
