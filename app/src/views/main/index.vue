<script setup lang="ts">
import {ref} from "vue";

const active=ref<number>('/main')
const onChange=(val)=>{
  // active.value=val;
}
</script>

<template>
  <div>
    <RouterView></RouterView>
    <van-tabbar route v-model="active" @change="onChange">
      <van-tabbar-item icon="home-o" to="/main/home">标签</van-tabbar-item>
      <van-tabbar-item icon="search" to="/main/app">标签</van-tabbar-item>
      <van-tabbar-item icon="friends-o" to="/main/message">标签</van-tabbar-item>
      <van-tabbar-item icon="setting-o" to="/main/mine">标签</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>

</style>