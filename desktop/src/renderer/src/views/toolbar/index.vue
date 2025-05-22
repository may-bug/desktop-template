<template>
  <div class="toolbar">
    <Header window-id="toolbar" :is-min-max="false" :is-hide="true" />
  </div>
</template>

<script setup lang="ts">
import Header from '../../components/Header.vue'
import { useWebRTCShare } from '../../hook/useWebRTCShare'
import { useDataStore } from '../../stores/useDataStore'
import { onMounted } from 'vue'

const dataStore = useDataStore()
const webRTCShare = useWebRTCShare({
  signalingUrl: 'wss://server.tecgui.cn/ws/data',
  token: useDataStore.token,
  uid: dataStore.uid,
  deviceId: dataStore.deviceId
})

onMounted(async () => {
  await webRTCShare.startSharing()
})
</script>
