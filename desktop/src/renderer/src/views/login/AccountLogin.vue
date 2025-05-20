<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { loginByAccountApi } from '../../api/auth'
import { useDataStore } from '../../stores/useDataStore'
import { setValue } from '../../utils/store'

const dataStore = useDataStore()
const props = defineProps<{
  open?: () => void
}>()

const loginForm = ref({
  account: '',
  password: ''
})

const loading = ref(false)

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleSubmit = () => {
  loading.value = true
  loginByAccountApi(loginForm.value)
    .then((res) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      if (res.code === 200) {
        Message.success('登录成功')
        dataStore.setUid(res.data.uid)
        dataStore.setToken(res.data.token)
        setValue('uid', res.data.uid)
        setValue('token', res.data.token)
        props.open?.()
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        Message.error(res.msg)
      }
    })
    .then(() => {
      loading.value = false
    })
}
</script>

<template>
  <div class="login-container">
    <a-form class="login-form" :model="loginForm" layout="vertical">
      <a-form-item field="account" label="账号">
        <a-input v-model="loginForm.account" placeholder="请输入账号" allow-clear />
      </a-form-item>
      <a-form-item field="password" label="密码">
        <a-input-password v-model="loginForm.password" placeholder="请输入密码" allow-clear />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" long :loading="loading" @click="handleSubmit"> 登录 </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style scoped lang="scss">
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
  max-width: 400px;
  margin: 0 auto;
}

.login-form {
  width: 100%;
}
</style>
