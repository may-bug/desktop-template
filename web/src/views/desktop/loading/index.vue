<script setup lang="ts">
import {ref} from "vue";
import emit from "../../../hooks/useEmit.ts";
import {router} from "../../../router";

const loading=ref(true)
const handleResult=(val)=>{
  if(val.type=='answer'){
    router.push("/desktop/control")
    return
  }
  if(val.type=='reject'){
    router.back()
  }
}
emit.on("desktop",handleResult)
</script>

<template>
  <a-spin :loading="loading" :size="32" tip="正在连接中...">
  </a-spin>
</template>

<style scoped>

</style>