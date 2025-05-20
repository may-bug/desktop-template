<script setup lang="ts">
import {onMounted} from 'vue'
import {connectWebControl} from "../../hooks/useMessage.ts";
import {useDataStore} from "../../stores/useDataStore.ts";

const dataStore=useDataStore()


onMounted(()=>{
  connectWebControl(dataStore.token,dataStore.deviceId)
})
</script>

<template>
<RouterView></RouterView>
</template>

<style scoped>

</style>