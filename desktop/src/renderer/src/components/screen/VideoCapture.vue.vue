<template>
  <div class="video-capture">
    <div class="controls">
      <div class="control-group">
        <button :disabled="isCapturing" @click="startCapture('screen')">
          <span class="icon">🖥️</span> 捕获屏幕
        </button>
        <button :disabled="isCapturing" @click="startCapture('window')">
          <span class="icon">🪟</span> 捕获窗口
        </button>
        <button :disabled="!isCapturing" @click="stopCapture">
          <span class="icon">⏹️</span> 停止捕获
        </button>
      </div>

      <div class="settings">
        <div class="setting-item">
          <label>帧率 (FPS):</label>
          <input v-model="frameRate" type="number" min="1" max="60" :disabled="isCapturing" />
        </div>
        <div class="setting-item">
          <label>视频质量:</label>
          <select v-model="videoQuality" :disabled="isCapturing">
            <option value="high">高</option>
            <option value="medium" selected>中</option>
            <option value="low">低</option>
          </select>
        </div>
      </div>

      <div v-if="sources.length > 0 && !isCapturing" class="source-selector">
        <h3>选择捕获源</h3>
        <div class="source-list">
          <div
            v-for="source in filteredSources"
            :key="source.id"
            class="source-item"
            :class="{ active: selectedSourceId === source.id }"
            @click="selectSource(source)"
          >
            <img :src="source.thumbnail" class="thumbnail" />
            <div class="source-info">
              <div class="source-name">{{ formatSourceName(source.name) }}</div>
              <div class="source-type">{{ getSourceType(source) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="preview-container">
      <video
        ref="videoElement"
        autoplay
        muted
        playsinline
        class="video-preview"
        :class="{ active: isCapturing }"
      ></video>
      <div v-if="!isCapturing" class="placeholder">
        <div class="placeholder-icon">🎥</div>
        <div class="placeholder-text">视频预览将显示在这里</div>
      </div>

      <div v-if="isCapturing" class="capture-actions">
        <button class="record-btn" @click="toggleRecording">
          <span class="icon">{{ isRecording ? '⏸️' : '⏺️' }}</span>
          {{ isRecording ? '暂停录制' : '开始录制' }}
        </button>
        <div v-if="isRecording" class="recording-indicator">
          <div class="pulse"></div>
          <span>录制中 {{ recordingTime }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getDesktopSources } from '../../utils/screen'
import { requestDesktopCapturePermission, showPermissionError } from '../../utils/permission'
import { saveRecording } from '../../utils/file'

interface DesktopCapturerSource {
  id: string
  name: string
  thumbnail: string
}
const videoElement = ref<HTMLVideoElement | null>(null)
const sources = ref<DesktopCapturerSource[]>([])
const selectedSourceId = ref<string>('')
const isCapturing = ref<boolean>(false)
const isRecording = ref<boolean>(false)
const captureType = ref<'screen' | 'window' | 'all'>('all')
const frameRate = ref<number>(15)
const videoQuality = ref<'high' | 'medium' | 'low'>('medium')
const recordingStartTime = ref<number>(0)
const recordingTime = ref<string>('00:00')
let mediaRecorder: MediaRecorder | null = null
let recordedChunks: Blob[] = []
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
let timerInterval = null

const filteredSources = computed(() => {
  return sources.value
    .filter((source) => {
      if (captureType.value === 'screen') {
        return source.name.toLowerCase().includes('screen')
      } else if (captureType.value === 'window') {
        return !source.name.toLowerCase().includes('screen')
      }
      return true
    })
    .sort((a, b) => {
      const aIsScreen = a.name.toLowerCase().includes('screen')
      const bIsScreen = b.name.toLowerCase().includes('screen')
      if (aIsScreen && !bIsScreen) return -1
      if (!aIsScreen && bIsScreen) return 1
      return a.name.localeCompare(b.name)
    })
})

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getSources = async () => {
  try {
    const result = await getDesktopSources()
    sources.value = result.map((source: never) => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL()
    }))
  } catch (error) {
    console.error('获取视频源失败:', error)
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const startCapture = async (type: 'screen' | 'window') => {
  try {
    captureType.value = type
    await getSources()

    if (!selectedSourceId.value && sources.value.length > 0) {
      selectedSourceId.value = sources.value[0].id
    }

    if (selectedSourceId.value) {
      const constraints = getConstraints()
      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoElement.value) {
        videoElement.value.srcObject = stream
        isCapturing.value = true
        setupMediaRecorder(stream)
      }
    }
  } catch (error) {
    console.error('开始捕获失败:', error)
    showPermissionError()
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getConstraints = () => {
  const qualitySettings = {
    high: { width: 1920, height: 1080 },
    medium: { width: 1280, height: 720 },
    low: { width: 640, height: 480 }
  }

  return {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: selectedSourceId.value,
        minWidth: qualitySettings[videoQuality.value].width,
        maxWidth: qualitySettings[videoQuality.value].width,
        minHeight: qualitySettings[videoQuality.value].height,
        maxHeight: qualitySettings[videoQuality.value].height,
        minFrameRate: frameRate.value,
        maxFrameRate: frameRate.value
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const setupMediaRecorder = (stream: MediaStream) => {
  const options = { mimeType: 'video/webm; codecs=vp9' }
  recordedChunks = []

  try {
    mediaRecorder = new MediaRecorder(stream, options)

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data)
      }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' })
      await toSaveRecording(blob)
      recordedChunks = []
    }
  } catch (error) {
    console.error('MediaRecorder创建失败:', error)
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const stopCapture = () => {
  if (videoElement.value && videoElement.value.srcObject) {
    const tracks = (videoElement.value.srcObject as MediaStream).getTracks()
    tracks.forEach((track) => track.stop())
    videoElement.value.srcObject = null
  }

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }

  stopRecordingTimer()
  isCapturing.value = false
  isRecording.value = false
  mediaRecorder = null
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const toggleRecording = () => {
  if (!mediaRecorder) return

  if (isRecording.value) {
    mediaRecorder.pause()
    stopRecordingTimer()
  } else {
    mediaRecorder.resume()
    startRecordingTimer()

    if (mediaRecorder.state === 'inactive') {
      recordedChunks = []
      recordingStartTime.value = Date.now()
      mediaRecorder.start(1000) // 每1秒收集一次数据
    }
  }

  isRecording.value = !isRecording.value
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const startRecordingTimer = () => {
  recordingStartTime.value = Date.now()
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - recordingStartTime.value) / 1000)
    const minutes = Math.floor(elapsed / 60)
      .toString()
      .padStart(2, '0')
    const seconds = (elapsed % 60).toString().padStart(2, '0')
    recordingTime.value = `${minutes}:${seconds}`
  }, 1000)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const stopRecordingTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const toSaveRecording = async (blob: Blob) => {
  try {
    const arrayBuffer = await blob.arrayBuffer()
    await saveRecording(arrayBuffer)
  } catch (error) {
    console.error('保存录制失败:', error)
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const selectSource = (source: DesktopCapturerSource) => {
  selectedSourceId.value = source.id
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const formatSourceName = (name: string) => {
  return name.replace(/ - Google Chrome$/, '')
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getSourceType = (source: DesktopCapturerSource) => {
  return source.name.toLowerCase().includes('screen') ? '屏幕' : '窗口'
}

onMounted(() => {
  requestDesktopCapturePermission()
})

onUnmounted(() => {
  stopCapture()
})
</script>

<style scoped>
.video-capture {
  display: flex;
  height: calc(100vh - 30px);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.controls {
  width: 320px;
  padding: 20px;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.control-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

button {
  padding: 10px 15px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

button:hover {
  background: #3aa876;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.settings {
  margin: 20px 0;
  padding: 15px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.setting-item {
  margin-bottom: 15px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #555;
}

.setting-item input,
.setting-item select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.source-selector h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.source-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.source-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid #ddd;
  transition: all 0.2s;
}

.source-item:hover {
  border-color: #42b983;
}

.source-item.active {
  border-color: #42b983;
  background-color: #f0f9f5;
}

.thumbnail {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 3px;
  margin-right: 10px;
}

.source-info {
  flex: 1;
}

.source-name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 2px;
}

.source-type {
  font-size: 12px;
  color: #666;
}

.preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.video-preview {
  flex: 1;
  background: #000;
  display: none;
}

.video-preview.active {
  display: block;
}

.placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  background: #f0f0f0;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.placeholder-text {
  font-size: 16px;
}

.capture-actions {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.record-btn {
  background: #ff4d4f;
  padding: 10px 20px;
}

.record-btn:hover {
  background: #ff7875;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ff4d4f;
  font-size: 14px;
}

.pulse {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff4d4f;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(255, 77, 79, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
  }
}
</style>
