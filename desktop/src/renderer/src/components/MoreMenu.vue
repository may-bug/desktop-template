<script setup lang="ts">
import { ref } from 'vue'
import Icon from './Icon.vue'
import { closeWindow, createWindow } from '../utils/windows'
import { Message, Modal } from '@arco-design/web-vue'

// eslint-disable-next-line vue/require-prop-types
const show = defineModel('show')
const itemList = ref([
  {
    icon: 'menu-update',
    text: '检查更新',
    value: 'update'
  },
  {
    icon: 'menu-setting',
    text: '设置',
    value: 'setting'
  },
  {
    icon: 'menu-about',
    text: '关于',
    value: 'about'
  },
  {
    icon: 'menu-log',
    text: '日志',
    value: 'log'
  },
  {
    icon: 'menu-exit',
    text: '退出登录',
    value: 'exit'
  }
])

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleClick = (value) => {
  console.log(`Clicked on ${value}`)
  switch (value) {
    case 'setting':
      createWindow('setting', '设置', 800, 600, '/setting', false, undefined)
      break
    case 'about':
      createWindow('about', '关于', 300, 400, '/about', false, undefined)
      break
    case 'log':
      createWindow('log', '关于', 1000, 700, '/log', false, undefined)
      break
    case 'update':
      Message.success('已经是最新版了')
      break
    case 'exit':
      Modal.warning({
        title: '退出登录',
        content: '是否确认退出登录？',
        okText: '确认',
        hideCancel: false,
        alignCenter: true,
        cancelText: '取消',
        onOk() {
          createWindow('login', '登录', 320, 450, '/login', false, undefined)
          closeWindow('main')
        },
        onCancel(e) {
          console.log(e)
        }
      })
      break
    default:
      break
  }
}
/**
 * 点击菜单外部执行
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const clickOutSide = () => {
  show.value = false
}
</script>

<template>
  <div ref="more-menu" v-outside-click="clickOutSide" class="more-menu">
    <div
      v-for="(item, index) in itemList"
      :key="index"
      class="item"
      @click="handleClick(item.value)"
    >
      <div class="icon">
        <Icon :name="item.icon" :size="15" alt="More" />
      </div>
      <div class="text">{{ item.text }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.more-menu {
  position: relative;
  z-index: 2000;
  width: 150px;
  backdrop-filter: blur(4px) brightness(90%);
  background: rgba(255, 255, 255, 0.76);
  border-radius: 10px;
  padding: 2px 5px;
}
.item {
  display: flex;
  margin: 5px 0;
  padding: 5px 5px;
  border-radius: 10px;
  .icon {
    margin: 0 5px;
  }
  .text {
    padding: 0 5px;
  }
  &:hover {
    cursor: default;
    background: var(--color-fill-3);
  }
}
</style>
