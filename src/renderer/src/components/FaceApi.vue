<template>
  <div class="face">
    <video id="video" ref="videoRef" width="300" height="300" autoplay></video>
    <canvas id="overlay" ref="overlayRef" width="300" height="300"></canvas>
    <div style="text-align: center">{{ tip }}</div>
    <button v-if="currentSetup < setup && !isDetecting" @click="startDetection">
      开始检测
    </button>
    <div v-else-if="currentSetup >= setup">检测完成！</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as faceapi from '@vladmandic/face-api'

const videoRef = ref(null)
const overlayRef = ref(null)
const tip = ref('请按照提示进行操作')
const currentSetup = ref(0) // 当前已经完成检测的次数
const setup = ref(3) // 总共需要进行的检测次数
const isDetecting = ref(false) // 是否正在检测
const operations = ['张嘴', '点头', '向右转头', '向左转头', '眨眼', '睁大眼睛']
const currentOperation = ref(null)

const loadModels = async () => {
  const MODEL_URL = new URL('@renderer/assets/models', import.meta.url).href // 确保这个路径指向你的模型文件
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
  ])
}

const startVideo = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: {} })
  videoRef.value.srcObject = stream
  videoRef.value.play()
}

const getRandomOperation = () => {
  const randomIndex = Math.floor(Math.random() * operations.length)
  return operations[randomIndex]
}

const performDetection = async () => {
  isDetecting.value = true

  // 获取视频的实际宽度和高度
  const displaySize = { width: videoRef.value.videoWidth, height: videoRef.value.videoHeight }

  // 调整 canvas 尺寸以匹配视频的尺寸
  overlayRef.value.width = displaySize.width
  overlayRef.value.height = displaySize.height

  const detections = await faceapi
    .detectAllFaces(videoRef.value, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions()

  const ctx = overlayRef.value.getContext('2d')
  ctx.clearRect(0, 0, overlayRef.value.width, overlayRef.value.height)

  // 匹配 canvas 的尺寸与视频的尺寸
  faceapi.matchDimensions(ctx, displaySize)

  let operationPassed = false

  if (detections.length > 0) {
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    faceapi.draw.drawDetections(overlayRef.value, resizedDetections)
    faceapi.draw.drawFaceLandmarks(overlayRef.value, resizedDetections)
    faceapi.draw.drawFaceExpressions(overlayRef.value, resizedDetections)

    const expressions = detections[0].expressions
    const landmarks = detections[0].landmarks

    // 提前计算眼部中心点坐标
    const leftEyeCenterY = (landmarks.getLeftEye()[1].y + landmarks.getLeftEye()[5].y) / 2
    const rightEyeCenterY = (landmarks.getRightEye()[1].y + landmarks.getRightEye()[5].y) / 2

    switch (currentOperation.value) {
      case '张嘴':
        if (expressions.mouthOpen > 0.95) operationPassed = true
        break
      case '点头':
        const noseTipY = landmarks.getNose()[30].y
        const chinY = landmarks.getJawOutline()[8].y
        if (noseTipY > chinY + 10) operationPassed = true // 假设阈值为10像素
        break
      case '向右转头':
        if (leftEyeCenterY - rightEyeCenterY > 10) operationPassed = true // 假设阈值为10像素
        break
      case '向左转头':
        if (rightEyeCenterY - leftEyeCenterY > 10) operationPassed = true // 假设阈值为10像素
        break
      case '眨眼':
        if (
          Math.abs(landmarks.getLeftEye()[1].y - landmarks.getLeftEye()[5].y) > 10 &&
          Math.abs(landmarks.getRightEye()[1].y - landmarks.getRightEye()[5].y) > 10
        )
          operationPassed = true
        break
      case '睁大眼睛':
        if (expressions.surprised > 0.95) operationPassed = true
        break
    }
  }

  if (operationPassed) {
    currentSetup.value += 1
    tip.value = '操作成功，请继续下一个操作'
    setTimeout(() => {
      if (currentSetup.value < setup.value) {
        startDetection()
      } else {
        tip.value = '检测完成！'
      }
    }, 2000) // 延迟2秒后自动开始下一个操作
  } else {
    tip.value = `未检测到${currentOperation.value}，请重试`
    setTimeout(() => {
      tip.value = '请按照提示进行操作'
      isDetecting.value = false
    }, 3000) // 延迟3秒后复原为未开始检测的状态
  }

  isDetecting.value = false
}

const startDetection = async () => {
  currentOperation.value = getRandomOperation()
  if (!currentOperation.value) {
    tip.value = '所有操作已完成！'
    return
  }

  tip.value = `请${currentOperation.value}`
  setTimeout(() => {
    performDetection()
  }, 3000) // 延迟3秒等待用户做出动作
}

onMounted(async () => {
  await loadModels()
  await startVideo()
})
</script>

<style scoped lang="scss">
.face {
  position: relative;

  #video {
    width: 300px;
    height: 300px;
    border-radius: 50%;
    object-fit: cover; /* 确保视频内容不会变形 */
  }

  #overlay {
    width: 300px;
    height: 300px;
    border-radius: 50%;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none; /* 确保用户可以点击按钮 */
  }
}
</style>
