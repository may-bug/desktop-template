<template>
  <RouterView></RouterView>
</template>

<script setup>
import { useDataStore } from './stores/useDataStore'
import { getValue } from './utils/store'
import { onMounted } from 'vue'

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
