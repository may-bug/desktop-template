<script setup lang="ts">
import { createWindow, closeWindow } from '@renderer/utils/windows'
import Header from '@renderer/components/Header.vue'

/**
 * 打开主界面
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const openMainWindow = () => {
  createWindow('main', '主界面', 980, 720, '/', true, undefined)
  closeWindow('login')
}
</script>

<template>
  <div class="login">
    <Header window-id="login" :is-min-max="false"></Header>
    <div class="btn-container">
      <button class="start" @click="openMainWindow">开始</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login {
  width: 100vw;
  height: 100vh;
  background-image: linear-gradient(to top, #dad4ec 0%, #dad4ec 1%, #f3e7e9 100%);
  .btn-container {
    position: absolute;
    bottom: 30px;
    width: 100%;
    display: flex;
    justify-content: center;
    .start {
      border-radius: 25px;
      border: none;
      padding: 5px 15px;
      margin: auto;
      width: 60%;
      height: 12%;
      background: var(--color-primary);
      color: var(--text-color-primary);
    }
  }
}
</style>
