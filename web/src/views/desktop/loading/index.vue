<script setup lang="ts">
import {ref} from "vue";
import emit from "../../../hooks/useEmit.ts";
import {useRouter} from "vue-router";

const router = useRouter()
const loading=ref(true)
const handleResult=(val)=>{
  if(val.type=='answer'){
    console.log(val)
    router.push({path:"/desktop/control",query:{formId:val.body.from,toId:val.body.to}});
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