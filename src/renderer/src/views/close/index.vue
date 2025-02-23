<script setup lang="ts">
import Header from '@renderer/components/Header.vue'
import { closeWindow, exitApp } from '@renderer/utils/windows'
import { onMounted, ref, watch } from 'vue'
import { getConfig, hideNotExitWindow, setConfig } from '../../utils/windows'

const option = ref<boolean>(false)
const remember = ref<boolean>(false)
/**
 * 确定退出
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleConfirm = () => {
  if (option.value) {
    exitApp()
  } else {
    hideNotExitWindow()
  }
}
/**
 * 取消退出
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handleCancel = () => {
  closeWindow('close')
}
/**
 * 监听选项值的变化
 */
watch(option, (value) => {
  if (remember.value) {
    setConfig('closed_value', value)
  }
})
watch(
  remember,
  (value) => {
    setConfig('remember-closed', value)
  },
  {
    deep: true
  }
)
onMounted(() => {
  getConfig('closed_value').then((value) => {
    console.log(value)
    option.value = value
  })
})
</script>

<template>
  <Header window-title="提示" :is-min-max="false" window-id="close" :is-hide="false"></Header>
  <div class="context">
    <p>是否要退出软件？</p>
  </div>
  <div class="options">
    <a-radio-group v-model="option" class="group">
      <a-radio class="item" :value="false">保持后台运行</a-radio>
      <a-radio class="item" :value="true">直接退出</a-radio>
    </a-radio-group>
  </div>
  <div class="remember">
    <a-checkbox v-model:checked="remember">记住我的选择</a-checkbox>
  </div>
  <div class="btn-container">
    <button class="btn confirm" @click="handleConfirm">确定</button>
    <button class="btn cancel" @click="handleCancel">取消</button>
  </div>
</template>

<style scoped lang="scss">
.context {
  width: 100%;
  text-align: center;
}
.options {
  padding: 10px 40px;
  .group {
    display: flex;
    flex-direction: column;
  }
}
.remember {
  display: flex;
  justify-content: center;
}
.btn-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .btn {
    margin: 10px 10px 10px 10px;
    padding: 4px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-weight: 300;
  }
  .confirm {
    background: #3b82f6;
    color: white;
    border: none;
    &:hover {
      background: #2563eb;
    }
  }
  .cancel {
    background: transparent;
    color: #6b7280;
    border: 1px solid #e5e7eb;
    &:hover {
      background: #f3f4f6;
    }
  }
}
</style>
