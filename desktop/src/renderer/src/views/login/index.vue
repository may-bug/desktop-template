<script setup lang="ts">
import { createWindow, closeWindow } from '../../utils/windows'
import Header from '@renderer/components/Header.vue'
import AccountLogin from './AccountLogin.vue'
import QrLogin from './QrLogin.vue'
import { onMounted, ref } from 'vue'
import { isLoginAPI } from '../../api/auth'
import Icon from '../../components/Icon.vue'

const showView = ref('account')
const avatarUrl = ref('avatar')
/**
 * 打开主界面
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const openMainWindow = () => {
  createWindow('main', '主界面', 980, 720, '/main', true, undefined)
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
onMounted(async () => {
  isLoginAPI().then((res) => {
    if (res.code === 200 && res.data) {
      setTimeout(() => {
        openMainWindow()
      }, 3000)
    }
  })
})
</script>

<template>
  <div class="login">
    <Header window-id="login" :is-min-max="false"></Header>
    <div v-if="showView == 'loading' || showView == 'account'" class="avatar">
      <Icon v-if="avatarUrl == 'avatar'" name="common-avatar" :size="80" />
      <img v-else class="avatar-img" :src="avatarUrl" alt="头像" />
    </div>
    <AccountLogin v-if="showView === 'account'" :open="openMainWindow" :loading="showView" />
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
  .link-container {
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
.avatar {
  margin: 10px 0;
  padding: 10px 0;
  color: var(--color-primary);
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  .avatar-img {
    width: 80px;
    height: 80px;
  }
}
</style>
