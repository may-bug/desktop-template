<template>
  <div v-if="!deviceError" class="face">
    <div class="video-container">
      <video id="video" ref="videoRef" width="300" height="300" autoplay></video>
      <div v-if="loading" class="loader con">
        <div class="loader-content"></div>
        <div class="tip">数据校验中...</div>
      </div>
      <div v-if="success == 1" class="success con">
        <div class="tip">检测成功</div>
      </div>
      <div v-if="success == 2" class="error con">
        <div class="tip">检测失败</div>
      </div>
    </div>
    <div class="option">
      <div class="tip">{{ tip }}</div>
      <a-button class="btn" type="primary" :disabled="isDetecting" @click="handleStart"
        >{{ btnTip }}</a-button
      >
    </div>
  </div>
  <div v-else class="error">
    <p>摄像头调用错误</p>
    <a-button type="primary" @click="handleStart">重试</a-button>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { onMounted, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { logger } from '../utils/log'
import * as faceapi from '@vladmandic/face-api'
import { faceAuth } from '../api/auth'

const tip = ref('请点击开始检测')
const btnTip = ref('开始检测')
const deviceError = ref(false)
const videoRef = ref(null)
const loading = ref(false) // 控制加载指示器的显示
const isDetecting = ref(false) // 控制检测状态
let detectIntervalId = null // 定时器ID
let errorMessageShown = false // 标志位，用于控制是否已经显示了错误消息
const success = ref(0) //检测结果

/**
 * 获取摄像头信息
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getUserMedia = () => {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      videoRef.value.srcObject = stream
      videoRef.value.play()
    })
    .catch((err) => {
      logger('error', err)
      Message.error(`摄像头调用失败，请检查摄像头使用权限`)
      deviceError.value = true
    })
}

/**
 * 开始识别
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleStart = () => {
  deviceError.value = false
  isDetecting.value = true
  errorMessageShown = false // 重置错误消息标志位
  success.value = 0
  getUserMedia()
  startDetection()
  tip.value = '请将人脸放入取景框中'
}

/**
 * 导入模型
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initFaceApi = async () => {
  const MODEL_URL = new URL('@renderer/assets/models', import.meta.url).href
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
  ])
}

/**
 * 开始检测
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const startDetection = () => {
  if (detectIntervalId !== null) return
  detectIntervalId = setInterval(detectFaces, 100)
}

/**
 * 停止检测
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const stopDetection = () => {
  if (detectIntervalId !== null) {
    clearInterval(detectIntervalId)
    detectIntervalId = null
  }
}

/**
 * 人脸检测
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const detectFaces = async () => {
  if (!videoRef.value) return

  try {
    const detections = await faceapi
      .detectAllFaces(videoRef.value, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()

    if (detections.length === 0) {
      tip.value = '未检测到人脸，请将人脸放入取景框中'
      return
    }

    sendFaceImageToServer(videoRef.value)
  } catch (error) {
    logger('error', error)
    if (!errorMessageShown) {
      Message.error(`人脸识别失败 ${error}`)
      errorMessageShown = true
    }
    resetAfterSend()
  }
}

/**
 * 发送数据到服务器
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const sendFaceImageToServer = (video) => {
  // 检测到人脸，准备发送数据
  loading.value = true // 显示加载指示器
  videoRef.value.pause()
  stopDetection() // 停止检测
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
  const imageDataURL = canvas.toDataURL('image/jpeg')

  faceAuth({ data: imageDataURL })
    .then((res) => {
      loading.value = false
      if (res.data.code === 200) {
        logger('info', '人脸图片已成功上传')
        tip.value = '人脸图片已成功上传'
        success.value = 1
      } else {
        logger('error', '人脸图片上传失败')
        if (!errorMessageShown) {
          Message.error('人脸图片上传失败')
          errorMessageShown = true
        }
      }
    })
    .catch((error) => {
      success.value = 2
      logger('error', error.message)
      if (!errorMessageShown) {
        Message.error('人脸图片上传失败')
        errorMessageShown = true
      }
    })
    .finally(() => {
      resetAfterSend()
    })
}

/**
 * 重置状态
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const resetAfterSend = () => {
  loading.value = false // 隐藏加载指示器
  isDetecting.value = false // 标记检测结束
  tip.value = '请将人脸放入取景框中'
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  videoRef.value.play()
  btnTip.value = '重新开始检测'
}

onMounted(() => {
  getUserMedia()
  initFaceApi()
})
</script>

<style scoped lang="scss">
.face {
  width: 250px;
  height: 300px;
  padding-top: 50px;
  position: relative;

  .video-container {
    position: relative;
    width: 200px;
    height: 200px;
    margin: auto;

    #video {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      z-index: 1;
    }
    .con {
      position: absolute;
      width: 200px;
      height: 200px;
      top: 0;
      left: 0;
      border-radius: 50%;
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    .success {
      background: var(--color-success);
      color: white;
    }

    .error {
      background: var(--color-error);
      color: white;
    }

    .loader {
      background: rgba(0, 0, 0, 0.7);
      color: white;
      .tip {
        padding: 20px 0;
        text-align: center;
      }
    }

    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .loader-content {
      position: relative;
      width: 78px;
      height: 78px;
      border: 15px dotted var(--color-primary);
      border-radius: 50%;
      animation: rotation 4s linear infinite;
    }
  }

  .option {
    display: flex;
    justify-content: center;
    flex-direction: column;
    .tip {
      padding: 20px 0;
      text-align: center;
    }
    .btn {
      margin: 0 30%;
      width: 40%;
    }
  }
}
</style>
