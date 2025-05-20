<script setup lang="ts">
import {onMounted, ref} from 'vue'
import { Message } from '@arco-design/web-vue'
import { router } from '../../router'
import {connectWebControl, sendControlRequest} from "../../hooks/useMessage.ts";
import {useDataStore} from "../../stores/useDataStore.ts";

const dataStore=useDataStore();
// 用户输入的设备 ID
const inputDeviceId = ref('')

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const connectToDevice = () => {
  const trimmedId = inputDeviceId.value.trim()

  if (!trimmedId) {
    Message.warning('请输入设备 ID')
    return
  }

  sendControlRequest(trimmedId,dataStore.deviceId)

  Message.success(`正在连接设备 ${trimmedId}...`)
  router.push('/desktop')
}

onMounted(()=>{
  connectWebControl(dataStore.token,dataStore.deviceId)
})
</script>

<template>
  <div class="device-input-container">
    <div class="device-input-panel">
      <h2>远程连接设备</h2>
      <a-input
          v-model="inputDeviceId"
          placeholder="请输入设备 ID"
          allow-clear
          style="margin-bottom: 16px"
      />
      <a-button type="primary" long @click="connectToDevice">连接设备</a-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.device-input-container {
  height: calc(100vh - 30px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-input-panel {
  width: 320px;
  padding: 32px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow);
  background-color: var(--color-bg-2);
}
</style>
