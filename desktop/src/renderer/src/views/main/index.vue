<template>
  <div class="main">
    <div class="side">
      <SideBar></SideBar>
    </div>
    <div class="container">
      <Header window-id="main" :is-tips="true"></Header>
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '@renderer/components/Header.vue'
import { onMounted } from 'vue'
import { updateInfo } from '../../utils/update'
import SideBar from '../../components/SideBar.vue'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initMessage = () =>{
  window.electron.ipcRenderer.send('sub-desktop-message')
}
onMounted(() => {
  updateInfo()
  initMessage()
})
</script>

<style scoped lang="scss">
.main {
  display: flex;
  height: 100vh;
  .side {
    width: 60px;
    background: var(--color-fill-1);
  }
  .container {
    flex-grow: 1;
  }
}
</style>
