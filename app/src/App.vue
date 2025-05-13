<template>
  <van-config-provider theme="light">
    <router-view v-slot="{ Component, route }">
      <transition
          :name="`page-${route.meta.transition || ''}`"
          mode="out-in"
      >
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </van-config-provider>
</template>

<script setup lang="ts">
//@ts-nocheck
import {inject, onMounted} from "vue";

onMounted(()=>{
  const themeChange=inject("theme")
  themeChange("dark")
})
</script>