<template>
  <transition name="fade">
    <Notify :id="store.current.title">
      <div v-if="store.current" class="notify-box" v-html="store.current.html" />
    </Notify>
  </transition>
</template>

<script setup lang="ts">
import { useNotify } from '../../stores/useNotify'
import Notify from '../../components/Notify.vue'
const store = useNotify()
</script>

<style scoped>
.notify-box {
  position: fixed;
  right: 20px;
  bottom: 40px;
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
