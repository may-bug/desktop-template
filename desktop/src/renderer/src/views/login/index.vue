<script setup lang="ts">
import { createWindow, closeWindow } from '../../utils/windows'
import Header from '@renderer/components/Header.vue'
import AccountLogin from './AccountLogin.vue'
import QrLogin from './QrLogin.vue'
import { ref } from 'vue'

const showView = ref('account')
/**
 * 打开主界面
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const openMainWindow = () => {
  createWindow('main', '主界面', 980, 720, '/', true, undefined)
  closeWindow('login')
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleClick = () => {
  if (showView.value == 'account') {
    showView.value = 'qr'
  } else {
    showView.value = 'account'
  }
}
</script>

<template>
  <div class="login">
    <Header window-id="login" :is-min-max="false"></Header>
    <AccountLogin v-if="showView === 'account'" :open="openMainWindow" />
    <QrLogin v-if="showView === 'qr'" :open="openMainWindow" />
    <div class="link-container">
      <div class="link" @click="handleClick">{{ showView === 'qr' ? '账号登录' : '扫码登录' }}</div>
      <div class="link">账号注册</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login {
  width: 100vw;
  height: 100vh;
  background-image: linear-gradient(to top, #dad4ec 0%, #dad4ec 1%, #f3e7e9 100%);
  .link-container{
    width: 100%;
    position: absolute;
    bottom: 30px;
    left: 0;
    display: flex;
    justify-content: center;
    .link {
      margin: 0 15px;
      color: var(--color-primary);
      text-align: center;
      &:hover {
        cursor: pointer;
      }
    }
  }
}
</style>
