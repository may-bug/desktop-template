<template>
  <div class="toolbar">
    <Header window-id="toolbar" :is-min-max="false" :is-hide="true" />
  </div>
</template>

<script setup lang="ts">
import Header from '../../components/Header.vue'
import { useWebRTCShare } from '../../hook/useWebRTCShare'
import { useDataStore } from '../../stores/useDataStore'
import { onMounted, ref } from 'vue'

const dataStore = useDataStore()
const from=ref()
const webRTCShare = useWebRTCShare({
  signalingUrl: 'wss://server.tecgui.cn/ws/signaling',
  token: dataStore.token,
  uid: dataStore.uid,
  deviceId: dataStore.deviceId,
  to: from.value
})
onMounted(async () => {
  await webRTCShare.startSharing()
})
</script>
