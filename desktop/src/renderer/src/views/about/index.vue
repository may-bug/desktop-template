<script setup lang="ts">
import Header from '../../components/Header.vue'
import { openLink } from '../../utils/windows'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const showAgreement = () => {
  openLink('https://tecgui.cn')
}
</script>

<template>
  <Header window-id="about" :is-min-max="false"></Header>
  <div class="container">
    <img src="@renderer/assets/img/public/logo.png" alt="QQ Penguin" class="penguin" />
    <div class="version-info">
      <div class="tc app">Codelin</div>
      <div class="tc version">版本: 1.0.0.1 (64位)</div>
      <div class="tc copyright">Copyright © 2023-{{ new Date().getFullYear() }} tecgui.cn.</div>
      <div class="tc right">
        All Rights Reserved.<a class="ta" href="#" @click.prevent="showAgreement">服务协议</a>
      </div>
    </div>
    <div class="stack-info">
      <div class="text">基于</div>
      <img class="logo" src="@renderer/assets/img/public/electron.svg" alt="electron" />
      <div class="text">技术栈</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  text-align: center;
  padding-top: 50px;
}

.penguin {
  width: 150px;
  height: auto;
}

.version-info {
  margin-top: 20px;
  .tc {
    margin: 5px 0;
  }
  .ta {
    padding: 0 5px;
  }
  .version {
    font-size: var(--font-size-base);
  }
  .copyright {
    font-size: var(--font-size-sm);
  }
  .right {
    font-size: var(--font-size-sm);
    a {
      text-decoration: none;
      color: var(--color-primary);
    }
  }
}
.stack-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  .logo {
    width: 20px;
    height: 20px;
    margin: 0 5px;
  }
}
</style>
