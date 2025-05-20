<template>
  <RouterView></RouterView>
</template>

<script setup>
import { useDataStore } from './stores/useDataStore'
import { getValue } from './utils/store'
import { onMounted } from 'vue'
import { useNotify } from './stores/useNotify'

const notify = useNotify()

notify.add({
  id: 'id-001',
  html: '<strong>新通知：</strong> 你有一条未读消息。',
  timeout: 4000
})

const dataStore = useDataStore()
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initStore = () => {
  getValue('uid').then((value) => {
    dataStore.setUid(value)
  })
  getValue('token').then((value) => {
    dataStore.setToken(value)
  })
}
onMounted(initStore)
</script>
