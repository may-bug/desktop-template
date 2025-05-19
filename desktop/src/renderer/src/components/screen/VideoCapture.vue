<template>
  <div class="video-capture">
    <div class="screen-list">
      <div
        v-for="(item, index) in screenList"
        :key="index"
        class="screen-card"
        :class="selectScreen == item ? 'selected' : ''"
        @click="selectScreen = item"
      >
        <img :src="item.image" alt="" />
        <div class="name">{{ item.name }}</div>
      </div>
    </div>
    <div class="video">
      <video ref="video" autoplay playsinline style="width: 100%; height: 100%"></video>
    </div>
    <div class="opt-list">
      <a-button class="btn" type="primary" status="success" @click="getDesktopSourceList"
        >刷新屏幕</a-button
      >
      <a-button class="btn" type="primary" :disabled="selectScreen == null" @click="startRecord"
        >开始录制</a-button
      >
      <a-button class="btn" type="primary" status="danger" :disabled="!recording"
        >停止录制</a-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { getDesktopSources } from '../../utils/screen'
import { onMounted, ref, useTemplateRef } from 'vue'
import { Message } from '@arco-design/web-vue'

const screenList = ref(null)
const selectScreen = ref(null)
const videoRef = useTemplateRef('video')
const recording = ref(false)

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getDesktopSourceList = () => {
  selectScreen.value = null
  getDesktopSources().then((res) => {
    screenList.value = []
    for (const item of res) {
      screenList.value.push({
        name: item.name,
        id: item.id,
        thumbnail: item.thumbnail,
        image: item.thumbnail.toDataURL()
      })
    }
  })
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const startRecord = async () => {
  if (!selectScreen.value) {
    Message.error('未选中屏幕')
    return
  }
  console.log(selectScreen.value)
  try {
    // 修改 constraints 配置
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        // @ts-ignore - 强制指定 Electron 扩展属性
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: selectScreen.value.id,
          minWidth: 1280, // 可选：限制分辨率
          maxWidth: 1920,
          minHeight: 720,
          maxHeight: 1080
        }
      }
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    handleStream(stream)
  } catch (e) {
    console.log(e)
    Message.error(e.message)
  }
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleStream = (stream) => {
  console.log(videoRef.value)
  console.log(stream)
  videoRef.value.srcObject = stream
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  videoRef.value.onloadedmetadata = () => videoRef.value.play()
}
onMounted(() => {
  getDesktopSourceList()
})
</script>

<style scoped lang="scss">
.video-capture {
  width: calc(100vw - 60px);
  height: calc(100vh - 30px);
  .screen-list {
    width: 100%;
    overflow-x: auto;
    display: flex;
    flex-direction: row;
    justify-content: start;
    //flex-wrap: wrap;
    .screen-card {
      border: 1px solid transparent;
      border-radius: 12px;
      padding: 5px;
      width: 200px;
      margin: 10px;
      img {
        width: 100%;
        border-radius: 12px;
      }
    }
    .selected {
      border: 1px solid black;
    }
    .name {
      line-height: 16px;
      height: 48px;
      overflow: hidden;
    }
  }
  .opt-list {
    .btn {
      margin: 0 10px;
    }
  }
  .video {
    width: 100%;
    height: calc(100% - 280px);
    background: rgba(0, 0, 0, 0.5);
    margin: 20px 0;
  }
}
</style>
