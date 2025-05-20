<template>
  <div class="toolbar">
    <Header window-id="toolbar" :is-hide="true" :is-min-max="false" />
  </div>
</template>

<script setup lang="ts">
import Header from '../../components/Header.vue'
import { getPlatform } from '../../utils/permission'
import { getDesktopSources } from '../../utils/screen'
import { onMounted, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { useWebRTCShare } from '../../hook/useWebRTCShare'
import { useDataStore } from '../../stores/useDataStore'
import { getValue } from '../../utils/store'

const from = ref('')
const dataStore = useDataStore()
let webRTCShare = useWebRTCShare({
  signalingUrl: 'wss://server.tecgui.cn/ws/signaling',
  token: dataStore.token,
  uid: dataStore.uid,
  deviceId: dataStore.deviceId,
  to: from.value
})
const stream = ref()
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
      console.log(stream.value)
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
  // if (videoRef.value) {
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   //@ts-ignore
  //   videoRef.value.srcObject = stream
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   //@ts-ignore
  //   // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  //   videoRef.value.onloadedmetadata = () => videoRef.value.play()
  // }
  webRTCShare.localStream.value = stream
  webRTCShare.startSharing()
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const init = async () => {
  from.value = await getValue('desktop.from')
}
onMounted(async () => {
  await init()
  await startRecord()
})
</script>
