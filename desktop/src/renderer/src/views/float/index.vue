<template>
  <div class="float-ball" @mousedown="startDrag" @contextmenu.prevent="toggleClickThrough"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { floatDrag, setFloatClickThrough } from '../../utils/windows'

const isClickThrough = ref(false)

// 右键切换点击穿透
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const toggleClickThrough = () => {
  isClickThrough.value = !isClickThrough.value
  setFloatClickThrough(isClickThrough.value)
}

// 左键拖拽处理
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/no-unused-vars
const startDrag = (_e) => {
  if (isClickThrough.value) return

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const updatePosition = (e) => {
    floatDrag({
      screenX: e.screenX - 25, // 中心点对齐
      screenY: e.screenY - 25
    })
  }

  window.addEventListener('mousemove', updatePosition)
  window.addEventListener(
    'mouseup',
    () => {
      window.removeEventListener('mousemove', updatePosition)
    },
    { once: true }
  )
}
onMounted(() => {
  setFloatClickThrough(false)
})
</script>

<style scoped>
.float-ball {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(66, 185, 131, 0.8);
  cursor: move;
  pointer-events: auto !important;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
