<script setup lang="ts">
import {ref} from "vue";
import {connectToDevice} from "../../../hooks/useDesktopEmit";
import {Message} from "@arco-design/web-vue";

const inputDeviceId=ref("155150264")
const connectDevice=()=>{
  const trimmedId = inputDeviceId.value.trim()
  if (!trimmedId) {
    Message.warning('请输入设备 ID')
    return
  }
  connectToDevice(trimmedId)
}
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
      <a-button type="primary" long @click="connectDevice">连接设备</a-button>
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
