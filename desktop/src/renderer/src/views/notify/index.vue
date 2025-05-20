<template>
  <transition name="fade">
    <Notify title="邀请协助">

      <a-button type="primary" status="danger" @click="handleReject">拒绝</a-button>
      <a-button type="primary" status="normal" @click="handleAgree">同意</a-button>
    </Notify>
  </transition>
</template>

<script setup lang="ts">
import Notify from '../../components/Notify.vue'
import { onMounted, ref } from 'vue'
import { sendDesktopMessage } from '../../utils/message'

const time = ref<number>(60)
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initTimer = () => {
  setInterval(() => {
    time.value--
  })
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleAgree = () => {
  sendDesktopMessage({
    type: 'answer',
    to: ''
  })
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleReject = () => {
  sendDesktopMessage({
    type: 'reject'
  })
}
onMounted(() => {
  initTimer()
})
</script>

<style scoped>
.notify-box {
  position: relative;
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 9999;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
