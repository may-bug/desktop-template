<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
  deviceId: route.query.formId, // 目标设备 ID
  to:route.query.toId
})

onMounted(async () => {
  const stream = await webRTCWatch.startWatching()
  if (videoRef.value && stream.value) {
    videoRef.value.srcObject = stream.value
    videoRef.value.play()
  }
})
</script>

<template>
  <video ref="videoRef" autoplay playsinline controls muted></video>
</template>
