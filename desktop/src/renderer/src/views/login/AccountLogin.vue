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
    <form class="login-form" @submit.prevent="handleSubmit">
      <input v-model="loginForm.account" />
      <input v-model="loginForm.password" type="password" />
      <button class="start" type="submit">开始</button>
    </form>
    <div class="btn-container">
      <button class="start" @click="props.open">登录</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.btn-container {
  bottom: 30px;
  width: 100%;
  display: flex;
  justify-content: center;
  .start {
    border-radius: 25px;
    border: none;
    padding: 5px 15px;
    margin: auto;
    width: 60%;
    height: 12%;
    background: var(--color-primary);
    color: var(--text-color-primary);
  }
}
</style>
