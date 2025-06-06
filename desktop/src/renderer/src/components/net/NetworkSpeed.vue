<script setup lang="ts">
import { onBeforeMount, onMounted, reactive, ref } from 'vue'
const props = defineProps({
  winId: {
    type: String,
    required: false
  }
})
const result = reactive({
  iface: '',
  uploadSpeed: '',
  downloadSpeed: ''
})

const error = ref<boolean>(false)
const handleResult: void = (_event, data) => {
  result.iface = data.iface
  result.uploadSpeed = data.uploadSpeed
  result.downloadSpeed = data.downloadSpeed
}

const startListen: void = () => {
  window.electron.ipcRenderer.send('network-speed-listen-start', props.winId)
  window.electron.ipcRenderer.on('network-speed', handleResult)
  window.electron.ipcRenderer.on('network-speed-error', (_event, error) => {
    error.value = true
  })
}
const stopListen: void = () => {
  window.electron.ipcRenderer.send('network-speed-listen-stop')
}
onMounted(() => {
  startListen()
})
onBeforeMount(() => {
  stopListen()
})
</script>

<template>
  <div>
    <p>
      当前网络接口：<span id="interface-name">{{ result.iface }}</span>
    </p>
    <p>
      上传速度：<span id="upload">{{ result.uploadSpeed }}</span>
    </p>
    <p>
      下载速度：<span id="download">{{ result.downloadSpeed }}</span>
    </p>
    <p v-if="error" id="error-message" style="color: red"></p>
  </div>
</template>

<style scoped lang="scss"></style>
