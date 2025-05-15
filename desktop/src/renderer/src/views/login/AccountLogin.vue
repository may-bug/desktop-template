<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { loginByAccountApi } from '../../api/auth'

import { ref } from 'vue'

const props = defineProps({
  open: {
    type: Function
  }
})

const loginForm = ref({
  account: '',
  password: ''
})
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleSubmit = (e) => {
  console.log(e.target)
  loginByAccountApi(loginForm.value).then((res) => {
    console.log(res)
  })
}
</script>

<template>
  <div class="login-container">
    <a-form class="login-form" @submit.prevent="handleSubmit">
      <a-input v-model="loginForm.account" />
      <a-input v-model="loginForm.password" type="password" />
      <a-button class="start">开始</a-button>
    </a-form>
    <div class="btn-container">
      <a-button class="start" @click="props.open">登录</a-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.btn-container {
  bottom: 30px;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
