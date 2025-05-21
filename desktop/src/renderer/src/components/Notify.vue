<template>
  <div class="toolbar">
    <div
      class="header"
      :style="props.isFixed ? 'position:fixed;top:0;width:100%;left:0;z-index:2000' : ''"
    >
      <div class="title">
        <span>{{ props.windowTitle }}</span>
      </div>
      <div class="move"></div>
      <div class="icon close" @click="handleClosed"><Icon name="base-Close" :size="12" /></div>
    </div>
    <div class="pla"></div>
    <slot></slot>
  </div>
</template>

<script setup>
import Icon from './Icon.vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  }
})

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleClosed = () => {
  window.electron.ipcRenderer.send('notify-close')
}
</script>

<style lang="scss" scoped>
.pla{
  position: relative;
  width: 100%;
  height: 30px;
}
.header {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  height: 30px;
  width: 100%;
  overflow: hidden;
  background: transparent;
}

.move {
  flex: 1;
  -webkit-app-region: drag;
}

.icon:hover {
  cursor: pointer;
  background: var(--background-color-hover);
}

.close:hover {
  cursor: pointer;
  background: #f53f3f;
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  padding: 2.5px 10px;
}

.title {
  line-height: 15px;
  padding: 5px 0 5px 15px;
  -webkit-app-region: drag;
  cursor: pointer;
}
</style>
