<template>
  <div class="camera-container">
    <!-- 视频预览 -->
    <video ref="videoRef" autoplay :width="width" :height="height"></video>

    <!-- 控制按钮 -->
    <div class="controls">
      <button :disabled="!hasMultipleCameras" @click="toggleCamera">
        切换摄像头 ({{ activeCameraLabel }})
      </button>
      <button :disabled="!isCameraActive" @click="capturePhoto">拍照</button>
      <button :disabled="!isCameraActive" @click="stopCamera">关闭摄像头</button>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- 拍照预览 -->
    <img v-if="photoData" :src="photoData" :width="width" :height="height" alt="预览" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

type CameraDevice = {
  deviceId: string
  label: string
  isFront: boolean
}

// Props 定义
const props = withDefaults(
  defineProps<{
    width?: number
    height?: number
    photoFormat?: 'image/png' | 'image/jpeg'
    photoQuality?: number
  }>(),
  {
    width: 640,
    height: 480,
    photoFormat: 'image/png',
    photoQuality: 0.92
  }
)

// Emits 定义
const emit = defineEmits<{
  (e: 'photo-captured', data: string): void
  (e: 'error', error: Error): void
}>()

// Refs
const videoRef = ref<HTMLVideoElement | null>(null)
const isCameraActive = ref(false)
const error = ref<string | null>(null)
const photoData = ref<string | null>(null)
const cameras = ref<CameraDevice[]>([])
const activeCameraIndex = ref(0)

// Computed
const hasMultipleCameras = computed(() => cameras.value.length > 1)
const activeCameraLabel = computed(() => {
  return cameras.value[activeCameraIndex.value]?.label || '默认摄像头'
})

// 初始化摄像头
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initCamera = async (deviceId?: string) => {
  try {
    const constraints: MediaStreamConstraints = {
      video: deviceId ? { deviceId: { exact: deviceId } } : true
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      isCameraActive.value = true
    }
    await listCameras()
  } catch (err) {
    handleError(err as Error)
  }
}

// 获取摄像头列表
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const listCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    cameras.value = devices
      .filter((device) => device.kind === 'videoinput')
      .map((device) => ({
        deviceId: device.deviceId,
        label: device.label || '未知摄像头',
        isFront: /front|face/i.test(device.label)
      }))
  } catch (err) {
    handleError(err as Error)
  }
}

// 拍照功能
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const capturePhoto = () => {
  if (!videoRef.value) return

  const canvas = document.createElement('canvas')
  canvas.width = props.width
  canvas.height = props.height

  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height)
    photoData.value = canvas.toDataURL(props.photoFormat, props.photoQuality)
    emit('photo-captured', photoData.value)
  }
}

// 切换摄像头
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const toggleCamera = () => {
  activeCameraIndex.value = (activeCameraIndex.value + 1) % cameras.value.length
  const deviceId = cameras.value[activeCameraIndex.value].deviceId
  stopCamera()
  initCamera(deviceId)
}

// 关闭摄像头
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const stopCamera = () => {
  if (videoRef.value?.srcObject) {
    const stream = videoRef.value.srcObject as MediaStream
    stream.getTracks().forEach((track) => track.stop())
    isCameraActive.value = false
  }
}

// 错误处理
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleError = (err: Error) => {
  error.value = err.message
  emit('error', err)
  stopCamera()
}

// 生命周期
onMounted(async () => {
  await initCamera()
})

onUnmounted(() => {
  stopCamera()
})
</script>

<style scoped>
.camera-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

video {
  border: 2px solid #ccc;
  border-radius: 4px;
  background: #000;
}

.controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.error {
  color: red;
  padding: 1rem;
  border: 1px solid red;
  border-radius: 4px;
}
</style>
