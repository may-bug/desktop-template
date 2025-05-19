<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { createWindow } from '../../utils/windows'

interface Device {
  id: string
  name: string
  status: 'online' | 'offline'
  ip: string
}

// 假设是从后端获取的设备列表
const devices = ref<Device[]>([
  { id: '1', name: '办公电脑A', status: 'online', ip: '192.168.0.10' },
  { id: '2', name: '家庭电脑B', status: 'offline', ip: '192.168.0.20' },
  { id: '3', name: '笔记本C', status: 'online', ip: '192.168.0.30' }
])

const selectedDeviceId = ref<string | null>(null)

const selectedDevice = computed(() =>
  devices.value.find((d) => d.id === selectedDeviceId.value) ?? null
)

const handleSelectDevice = (id: string) => {
  selectedDeviceId.value = id
}

const connectToDevice = () => {
  if (!selectedDevice.value) return
  if (selectedDevice.value.status === 'offline') {
    Message.warning('设备不在线')
    return
  }
  Message.success(`正在连接 ${selectedDevice.value.name}...`)
  createWindow('remote','远程桌面', 980, 720, '/remote', true, undefined)
}
</script>

<template>
  <div class="device-control-container">
    <a-split style="height: 100%" :min="200" :max="400" default-size="300">
      <!-- 左侧设备列表 -->
      <template #first>
        <div class="device-list">
          <a-list bordered :split="true">
            <a-list-item
              v-for="device in devices"
              :key="device.id"
              :class="{ active: selectedDeviceId === device.id }"
              @click="handleSelectDevice(device.id)"
            >
              <div class="device-item">
                <div class="device-name">{{ device.name }}</div>
                <a-tag
                  :color="device.status === 'online' ? 'green' : 'gray'"
                  size="small"
                >
                  {{ device.status }}
                </a-tag>
              </div>
            </a-list-item>
          </a-list>
        </div>
      </template>

      <!-- 右侧控制面板 -->
      <template #second>
        <div class="control-panel">
          <template v-if="selectedDevice">
            <h3>{{ selectedDevice.name }}</h3>
            <p>IP 地址：{{ selectedDevice.ip }}</p>
            <p>状态：<a-tag :color="selectedDevice.status === 'online' ? 'green' : 'gray'">{{ selectedDevice.status }}</a-tag></p>
            <a-button
              type="primary"
              :disabled="selectedDevice.status !== 'online'"
              @click="connectToDevice"
            >
              连接设备
            </a-button>
          </template>
          <template v-else>
            <p>请选择左侧的设备以查看详情</p>
          </template>
        </div>
      </template>
    </a-split>
  </div>
</template>

<style scoped lang="scss">
.device-control-container {
  height: calc(100vh - 30px);
  display: flex;
  flex-direction: column;
}

.device-list {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.control-panel {
  padding: 24px;
}

.active {
  background-color: var(--color-fill-2);
}
</style>
