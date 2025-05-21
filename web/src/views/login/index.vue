<template>
  <div class="login-container">
    <a-form
        :model="form"
        labelCol="{ span: 5 }"
        wrapperCol="{ span: 19 }"
        style="max-width: 360px; margin: 100px auto; padding: 24px; box-shadow: 0 0 8px rgba(0,0,0,0.1); border-radius: 8px;"
    >
      <h2 style="text-align: center; margin-bottom: 24px;">登录</h2>

      <a-form-item label="账号" field="account">
        <a-input v-model="form.account" placeholder="请输入账号" />
      </a-form-item>

      <a-form-item label="密码" field="password">
        <a-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
        />
      </a-form-item>

      <a-form-item wrapperCol="{ offset: 5, span: 19 }">
        <a-button type="primary" html-type="submit" :loading="loading" block @click="onSubmit">
          登录
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue';
import { Message } from '@arco-design/web-vue';
import {isLoginAPI, loginByAccountAPI} from "../../api/auth"
import {router} from "../../router";
import {useDataStore} from "../../stores/useDataStore.ts";

const dataStore = useDataStore()
const form = ref({
  account: 'admin',
  password: '123456',
});

const loading = ref(false);

const onSubmit = () => {
      loading.value = true;
      loginByAccountAPI(form.value).then(res => {
        if(res.code === 200) {
          dataStore.setUid(res.data.uid);
          dataStore.setToken(res.data.token);
          setTimeout(() => {
            Message.success(res.msg);
            loading.value = false;
            router.push("/desktop")
            clearTimeout(this)
          }, 1000);
        }else{
          loading.value = false;
          Message.error(res.msg);
        }
      }).then(()=>{
        loading.value = false;
      })
};

onMounted(() => {
  isLoginAPI().then((res) => {
    if (res.code === 200 && res.data) {
      setTimeout(() => {
        router.push("/device")
      }, 3000)
    }
  })
})
</script>

<style scoped>
.login-container {
}
</style>
