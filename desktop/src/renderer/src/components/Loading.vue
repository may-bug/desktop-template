<script setup lang="ts"></script>

<template>
  <div class="box">
    <span></span>
  </div>
</template>

<style scoped lang="scss">
.box {
  text-align: center;
  width: 300px;
  height: 200px;
  margin: 20px auto;
}
.box > span {
  animation: loader 1000ms infinite linear;
  border-radius: 100%;
  border: 6px solid var(--color-primary);
  border-left-color: transparent;
  color: transparent;
  display: inline-block;
  line-height: 1.2;
  width: 50px;
  height: 50px;
}
@keyframes loader {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
