<script setup lang="ts">
import { reactive } from 'vue'
import { maxWindow, minWindow, resetWindow, closeWindow } from '../utils/windows'
import Icon from '@renderer/components/Icon.vue'
import { createWindow, exitApp, getConfig, hideWindow } from '../utils/windows'

const props = defineProps({
  /**
   * 窗口id
   */
  windowId: {
    type: String,
    require: true
  },
  /**
   * 窗口标题
   */
  windowTitle: {
    type: String,
    require: true
  },
  /**
   * 最大最小化
   */
  isMinMax: {
    type: Boolean,
    require: true,
    default: true
  },
  /**
   * 最大最小化
   */
  isHide: {
    type: Boolean,
    require: true,
    default: true
  },
  /**
   * 是否是主界面（弹出关闭提示）
   */
  isTips: {
    type: Boolean,
    require: true,
    default: false
  },
  /**
   * 是否可以重置大小
   */
  isResize: {
    type: Boolean,
    require: true,
    default: true
  },
  /**
   * 是否可以重置大小
   */
  isFixed: {
    type: Boolean,
    default: false
  }
})
const status = reactive({
  current: false
})
/**
 * 关闭窗口
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleClosed = () => {
  //是否有弹窗显示
  if (props.isTips) {
    getConfig('remember_closed').then((res) => {
      //是否记住选项
      if (res) {
        getConfig('closed_value').then((res) => {
          if (res) {
            exitApp()
          } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            hideWindow(props.windowId)
          }
        })
      } else {
        createWindow('close', '关闭', 300, 220, '/close', false, props.windowId)
      }
    })
  } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    closeWindow(props.windowId)
  }
}
/**
 * 隐藏窗口
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleMinimize = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  minWindow(props.windowId)
}
/**
 * 最大化窗口
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleMaxWindow = () => {
  status.current = true
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  maxWindow(props.windowId)
}
/**
 * 最小化窗口
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleMinWindow = () => {
  status.current = false
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  resetWindow(props.windowId)
}
</script>

<template>
  <div
    class="header"
    :style="props.isFixed ? 'position:fixed;top:0;width:100%;left:0;z-index:2000' : ''"
  >
    <div class="title">
      <span>{{ props.windowTitle }}</span>
    </div>
    <div class="move"></div>
    <div v-if="props.isHide" class="icon" @click="handleMinimize">
      <Icon name="base-Minus" :size="12" />
    </div>
    <div v-if="status.current && props.isMinMax" class="icon" @click="handleMinWindow">
      <Icon name="base-OffScreen" :size="12" />
    </div>
    <div v-if="!status.current && props.isMinMax" class="icon" @click="handleMaxWindow">
      <Icon name="base-FullScreen" :size="12" />
    </div>
    <div class="icon close" @click="handleClosed"><Icon name="base-Close" :size="12" /></div>
  </div>
  <div class="pla"></div>
</template>

<style scoped lang="scss">
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
