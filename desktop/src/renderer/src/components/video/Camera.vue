<template>
  <div class="camera-container">
    <!-- 视频预览 -->
    <video ref="videoElement" autoplay playsinline class="preview"/>

    <!-- 设备选择 -->
    <a-select
      v-model="selectedCamera"
      :options="cameraOptions"
      placeholder="选择摄像头"
      class="device-selector"
    />

    <!-- 控制按钮 -->
    <div class="controls">
      <a-button
        type="primary"
        @click="startCapture"
        :disabled="isCapturing"
      >
        {{ isCapturing ? '采集中...' : '开始采集' }}
      </a-button>
      <a-button
        type="outline"
        status="danger"
        @click="stopCapture"
        :disabled="!isCapturing"
      >
        停止
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getScreenStream } from '../../utils/screen'

type CameraDevice = {
  deviceId: string
  label: string
}

const videoElement = ref<HTMLVideoElement | null>(null)
const cameraOptions = ref<{ value: string; label: string }[]>([])
const selectedCamera = ref<string>()
const isCapturing = ref(false)
let mediaStream: MediaStream | null = null

// 获取摄像头列表
const enumerateDevices = async () => {
  try {
    const res=await getScreenStream()
    console.log(res)
    const devices = await navigator.mediaDevices.enumerateDevices()
    console.log('------devicesList', devices)
    const videoDevices = devices.filter(d => d.kind === 'videoinput')

    cameraOptions.value = videoDevices.map(device => ({
      value: device.deviceId,
      label: device.label || `摄像头 ${cameraOptions.value.length + 1}`
    }))

    if (videoDevices.length > 0) {
      selectedCamera.value = videoDevices[0].deviceId
    }
  } catch (error) {
    Message.error('设备枚举失败: ' + error.message)
  }
}

// 启动摄像头
const startCapture = async () => {
  if (!selectedCamera.value) {
    Message.warning('请先选择摄像头')
    return
  }
  console.log(selectedCamera.value)
  try {
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        frameRate: {
          ideal: 20
        },
        deviceId: selectedCamera.value,
      }
    }
    mediaStream = await window.navigator.mediaDevices.getUserMedia(constraints)
    console.log(mediaStream)
    attachStream(mediaStream)
    isCapturing.value = true
  } catch (error) {
    handleMediaError(error)
  }
}

// 停止摄像头
const stopCapture = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
    isCapturing.value = false
    if (videoElement.value) {
      videoElement.value.srcObject = null
    }
  }
}

// 绑定视频流
const attachStream = (stream: MediaStream) => {
  if (!videoElement.value) return
  console.log("rtes")
  videoElement.value.srcObject = stream
  videoElement.value.onloadedmetadata = () => {
    videoElement.value?.play().catch(error => {
      Message.error('视频播放失败: ' + error.message)
    })
  }
}

// 错误处理
const handleMediaError = (error: Error) => {
  console.error('媒体设备错误:', error)
  const errorMap: { [key: string]: string } = {
    NotAllowedError: '用户拒绝了权限请求',
    NotFoundError: '未找到摄像头设备',
    NotReadableError: '摄像头被其他程序占用',
    OverconstrainedError: '无法满足分辨率要求'
  }
  Message.error(errorMap[error.name] || `设备错误: ${error.message}`)
}

// 生命周期
onMounted(enumerateDevices)
onBeforeUnmount(stopCapture)
</script>

<style scoped>
.camera-container {
  width: 100%;
  height: calc(100vh - 30px);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #1a1a1a;
}

.preview {
  width: 100%;
  max-width: 1280px;
  height: 720px;
  background: #000;
  border-radius: 8px;
  margin: 20px 0;
}

.device-selector {
  width: 300px;
  margin-bottom: 20px;
}

.controls {
  gap: 15px;
  display: flex;
}
</style>