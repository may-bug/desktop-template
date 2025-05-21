<template>
  <transition name="fade">
    <Notify title="邀请协助">
      <div class="tips">
        该邀请
        <span :class="time <= 10 ? 'danger' : ''">{{ time }}</span>秒后自动拒绝
      </div>
      <div class="btn-container">
        <a-button class="btn" type="primary" status="danger" @click="handleReject">拒绝</a-button>
        <a-button class="btn" type="primary" status="normal" @click="handleAgree">同意</a-button>
      </div>
    </Notify>
  </transition>
</template>

<script setup lang="ts">
import Notify from '../../components/Notify.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { sendDesktopMessage } from '../../utils/message'
import { createToolbarWindow } from '../../utils/windows'

const time = ref(60)
let timerId: number | null = null

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function startTimer() {
  clearTimer()
  time.value = 60
  timerId = window.setInterval(() => {
    time.value--
    if (time.value <= 0) {
      sendDesktopMessage({ type: 'timeout' })
      window.electron.ipcRenderer.send('notify-close')
      clearTimer()
    }
  }, 1000)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function clearTimer() {
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function reset() {
  time.value = 60
  startTimer()
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function handleAgree() {
  sendDesktopMessage({ type: 'answer' })
  createToolbarWindow('工具栏', 300, 90)
  clearTimer()
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function handleReject() {
  sendDesktopMessage({ type: 'reject' })
  window.electron.ipcRenderer.send('notify-close')
  clearTimer()
}

onMounted(() => {
  startTimer()
  window.electron.ipcRenderer.on('notify-reset', reset)
})

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<style scoped>
.tips {
  margin: 20px 0;
  text-align: center;
  font-size: 16px;
}
.tips span {
  font-weight: bold;
  padding: 10px;
}
.btn-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
.btn {
  margin: 10px 40px 20px 0;
}
.danger {
  color: red;
}
</style>
