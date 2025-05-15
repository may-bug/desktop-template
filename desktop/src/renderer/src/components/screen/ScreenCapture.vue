<template>
  <div class="screen-capture">
    <div class="controls">
      <div class="button-group">
        <button :disabled="isCapturing" @click="captureScreen">
          <span class="icon">🖥️</span> 捕获屏幕
        </button>
        <button :disabled="isCapturing" @click="captureWindow">
          <span class="icon">🪟</span> 捕获窗口
        </button>
      </div>

      <div v-if="sources.length > 0" class="source-selector">
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
      <div class="preview" :class="{ 'has-image': capturedImage }">
        <img v-if="capturedImage" :src="capturedImage" alt="捕获的屏幕" />
        <div v-else class="placeholder">
          <div class="placeholder-icon">📷</div>
          <div class="placeholder-text">捕获的图像将显示在这里</div>
        </div>
      </div>
      <div v-if="capturedImage" class="preview-actions">
        <button class="save-btn" @click="saveCapture">保存截图</button>
        <button class="copy-btn" @click="copyToClipboard">复制到剪贴板</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getDesktopSources } from '../../utils/screen'
import { requestDesktopCapturePermission } from '../../utils/permission'
import { copyImageToClipboard } from '../../utils/clipboard'
import { saveImage } from '../../utils/file'

interface DesktopCapturerSource {
  id: string
  name: string
  thumbnail: string
}

const sources = ref<DesktopCapturerSource[]>([])
const selectedSourceId = ref<string>('')
const capturedImage = ref<string>('')
const isCapturing = ref<boolean>(false)
const captureType = ref<'screen' | 'window' | 'all'>('all')

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
      // 屏幕排在前面
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
    isCapturing.value = true
    const result = await getDesktopSources()
    sources.value = result.map((source: never) => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL()
    }))
  } catch (error) {
    console.error('获取屏幕源失败:', error)
  } finally {
    isCapturing.value = false
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const captureScreen = async () => {
  captureType.value = 'screen'
  await getSources()
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const captureWindow = async () => {
  captureType.value = 'window'
  await getSources()
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const selectSource = (source: DesktopCapturerSource) => {
  selectedSourceId.value = source.id
  capturedImage.value = source.thumbnail
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const formatSourceName = (name: string) => {
  // 移除 Chrome 窗口的冗余信息
  return name.replace(/ - Google Chrome$/, '')
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getSourceType = (source: DesktopCapturerSource) => {
  return source.name.toLowerCase().includes('screen') ? '屏幕' : '窗口'
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const saveCapture = async () => {
  if (capturedImage.value) {
    saveImage(capturedImage.value).then((result) => {
      console.log(result)
    })
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const copyToClipboard = async () => {
  if (capturedImage.value) {
    copyImageToClipboard(capturedImage.value).then((result) => {
      console.log(result)
    })
  }
}

onMounted(() => {
  requestDesktopCapturePermission()
})
</script>

<style scoped>
.screen-capture {
  display: flex;
  height: calc(100vh - 30px);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.controls {
  width: 300px;
  padding: 20px;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.button-group {
  display: flex;
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
}

.preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.preview.has-image {
  background: #333;
}

.preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.placeholder {
  text-align: center;
  color: #999;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.placeholder-text {
  font-size: 16px;
}

.preview-actions {
  padding: 15px;
  display: flex;
  justify-content: center;
  gap: 15px;
  border-top: 1px solid #ddd;
}

.save-btn {
  background: #42b983;
}

.copy-btn {
  background: #647eff;
}

.copy-btn:hover {
  background: #546de5;
}
</style>
