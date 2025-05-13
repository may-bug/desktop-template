<template>
  <RouterView></RouterView>
</template>

<script setup lang="ts">
//@ts-nocheck
import {inject, onMounted} from "vue";

onMounted(()=>{
  const themeChange=inject("theme")
  console.log(themeChange)
  themeChange("dark")
})
</script>