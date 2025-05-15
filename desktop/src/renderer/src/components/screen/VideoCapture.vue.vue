<template>
  <div class="video-capture">
    <div class="source-selector">
      <h2>选择视频源</h2>
      <div class="source-list">
        <div
          v-for="source in videoSources"
          :key="source.id"
          class="source-item"
          :class="{ active: selectedSource?.id === source.id }"
          @click="selectSource(source)"
        >
          <img :src="source.thumbnail" class="thumbnail" />
          <div class="source-info">
            <div class="source-name">{{ source.name }}</div>
            <div class="source-type">{{ source.id.includes('screen') ? '屏幕' : '窗口' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="video-preview">
      <video
        ref="videoElement"
        autoplay
        muted
        playsinline
        class="video-player"
        :class="{ active: isCapturing }"
      ></video>
      <div v-if="!isCapturing" class="placeholder">
        <div class="placeholder-icon">🎥</div>
        <div class="placeholder-text">视频预览将显示在这里</div>
      </div>
    </div>

    <div class="controls">
      <button
        @click="startCapture"
        :disabled="!selectedSource || isCapturing"
        class="control-btn start-btn"
      >
        开始捕获
      </button>
      <button @click="stopCapture" :disabled="!isCapturing" class="control-btn stop-btn">
        停止捕获
      </button>
      <button @click="refreshSources" class="control-btn refresh-btn">刷新源列表</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { getVideoSources, startVideoCapture, stopVideoCapture } from '../../utils/screen'

interface VideoSource {
  id: string
  name: string
  thumbnail: string
}

const videoElement = ref<HTMLVideoElement | null>(null)
const videoSources = ref<VideoSource[]>([])
const selectedSource = ref<VideoSource | null>(null)
const isCapturing = ref(false)
const currentStream = ref<MediaStream | null>(null)

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const loadVideoSources = async () => {
  try {
    const sources = await getVideoSources()
    videoSources.value = sources.map((source) => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL()
    }))
  } catch (error) {
    console.error('加载视频源失败:', error)
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const selectSource = (source: VideoSource) => {
  selectedSource.value = source
}

// // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// const startCapture = async () => {
//   if (!selectedSource.value) return
//
//   try {
//     const stream = startVideoCapture(selectedSource.value.id)
//
//     if (videoElement.value) {
//       videoElement.value.srcObject = stream
//       currentStream.value = stream
//       isCapturing.value = true
//     }
//   } catch (error) {
//     console.error('开始捕获失败:', error)
//     alert(`无法开始视频捕获: ${error.message}`)
//   }
// }
// 启动桌面捕获
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const startCapture = async () => {
  if (!selectedSource.value) return
  console.log(selectedSource.value)
  try {
    // 先触发权限请求
    await navigator.mediaDevices.getUserMedia({ audio: false, video: true })
    // 关键：通过浏览器 API 捕获媒体流
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: selectedSource.value.id,
          minWidth: 1280,
          maxWidth: 1920,
          minHeight: 720,
          maxHeight: 1080
        }
      }
    })

    currentStream.value = stream
    if (videoElement.value) {
      videoElement.value.srcObject = stream
      await videoElement.value.play()
    }
  } catch (error) {
    console.error('捕获失败:', error)
    alert(`错误: ${error.message}`)
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const stopCapture = () => {
  if (!selectedSource.value) return

  stopVideoCapture(selectedSource.value.id)

  if (videoElement.value && videoElement.value.srcObject) {
    ;(videoElement.value.srcObject as MediaStream).getTracks().forEach((track) => track.stop())
    videoElement.value.srcObject = null
  }

  currentStream.value = null
  isCapturing.value = false
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const refreshSources = () => {
  stopCapture()
  selectedSource.value = null
  loadVideoSources()
}

onMounted(() => {
  loadVideoSources()
})

onUnmounted(() => {
  stopCapture()
})
</script>

<style scoped>
.video-capture {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 30px);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.source-selector {
  margin-bottom: 20px;
}

.source-selector h2 {
  margin-bottom: 15px;
  color: #333;
}

.source-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  max-height: 300px;
  overflow-y: auto;
}

.source-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.source-item:hover {
  border-color: #42b983;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.source-item.active {
  border-color: #42b983;
  background-color: #f0f9f5;
}

.thumbnail {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 3px;
  margin-right: 10px;
}

.source-info {
  flex: 1;
}

.source-name {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.source-type {
  font-size: 12px;
  color: #666;
}

.video-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  border-radius: 4px;
  margin-bottom: 20px;
  position: relative;
}

.video-player {
  width: 100%;
  height: 100%;
  display: none;
}

.video-player.active {
  display: block;
}

.placeholder {
  position: absolute;
  color: #aaa;
  text-align: center;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.placeholder-text {
  font-size: 16px;
}

.controls {
  display: flex;
  gap: 10px;
}

.control-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.start-btn {
  background: #42b983;
  color: white;
}

.start-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.stop-btn {
  background: #ff4d4f;
  color: white;
}

.stop-btn:disabled {
  background: #ffccc7;
  cursor: not-allowed;
}

.refresh-btn {
  background: #1890ff;
  color: white;
}
</style>
