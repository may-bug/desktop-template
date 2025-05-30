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

onMounted(() => {
  updateInfo()
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
