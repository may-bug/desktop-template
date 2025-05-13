<!-- src/App.vue -->
<template>
  <div class="app">
    <h1>WebRTC Video Chat</h1>
    <VideoChat :user-id="userId" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VideoChat from '../../../components/video/VideoChat.vue'

const userId = ref(`user-${Math.random().toString(36).substring(2, 8)}`)
</script>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

h1 {
  text-align: center;
  padding: 1rem;
  margin: 0;
  background: #4caf50;
  color: white;
}
</style>
