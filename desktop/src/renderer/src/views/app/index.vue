<script setup lang="ts">
import Header from '../../components/Header.vue'

import { router } from '../../router'
const handleDesktop=()=>{
  router.push("/desktop")
}
</script>

<template>
  <div>
    <Header window-id="app"></Header>
    <div class="card" @click="handleDesktop">
      <div class="desktop">远程桌面</div>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
