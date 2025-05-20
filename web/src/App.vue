<template>
  <RouterView></RouterView>
</template>

<script setup lang="ts">
import {useDataStore} from "./stores/useDataStore";
import {onMounted} from "vue";
import {generateNineDigitNumber} from "./utils/math.ts";
const dataStore = useDataStore();

const initDevice=()=>{
  if(dataStore.deviceId==undefined){
    dataStore.setDeviceId(generateNineDigitNumber())
  }
}
onMounted(()=>{
  initDevice()
})
</script>
