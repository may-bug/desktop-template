<template>
  <div class="login-container">
    <div class="login-box">
      <h2>登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
              id="username"
              v-model="username"
              type="text"
              required
              placeholder="输入用户名"
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
              id="password"
              v-model="password"
              type="password"
              required
              placeholder="输入密码"
          />
        </div>
        <button type="submit" class="login-button">登录</button>
      </form>
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import {nextTick, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {isLogin, login} from "../api/account.js";

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

const handleLogin = () => {
  if (username.value && password.value) {
    login({username:username.value, password:password.value}).then(async res => {
      if (res.code === 200) {
        await localStorage.setItem('token', res.data.token)
        const userId = `user_${Math.random().toString(36).substr(2, 9)}`
        await localStorage.setItem('userId', userId)
        setTimeout(() => {
          nextTick()
          router.push(`/room/list`)
        }, 500)
      }
    })

  } else {
    error.value = '请输入用户名和房间ID'
  }
}
onMounted(()=>{
  isLogin().then(res => {
    if(res.data){
      router.push('/room/list')
    }
  })
})
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.login-button:hover {
  background: #4338ca;
}

.error-message {
  margin-top: 1rem;
  color: #ef4444;
  text-align: center;
}
</style>