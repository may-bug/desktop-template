<script lang="ts" setup>
import {onMounted, ref} from "vue";
import emit from "../../../hooks/useEmit.ts";
import {useRouter} from "vue-router";

const router = useRouter()
const loading = ref(true)

const hasReject = ref(false)
const time = ref(60)
const initTimer = () => {
  time.value = 60
  setInterval(() => {
    time.value--
    if(time.value <= 1) {
      loading.value = false;
    }
  }, 1000)
}
/**
 * 取消协助
 */
const handleCancel=()=>{
  emit.emit("desktop",{
    type:"cancel"
  })
  router.push("/desktop")
}
/**
 * 重试协助
 */
const handleReuse=()=>{
  emit.emit("desktop",{
    type:"reuse"
  })
  time.value=60
  hasReject.value = false
}
/**
 * 结果处理
 * @param val
 */
const handleResult = (val) => {
  console.log(val)
  switch (val.type) {
    case 'answer':
      console.log(val)
      router.push({path: "/desktop/control", query: {formId: val.body.from, toId: val.body.to}});
      break;
    case 'reject':
      time.value=0
      hasReject.value = true
      break
    case 'timeout':
      time.value=0
      hasReject.value = false
      break;
    default:
      break
  }
}
emit.on("desktop", handleResult)

onMounted(() => {
  initTimer()
})
</script>

<template>
  <div class="container">
    <div class="tips">
      <div class="text" v-if="time>=0">正在等待对方接收邀请</div>
      <div class="time" v-if="time>=0">{{ time }}秒</div>
      <div class="text" v-if="time<0 && !hasReject">连接超时</div>
      <div class="text" v-if="hasReject">对方已拒绝</div>
    </div>
    <a-spin :loading="loading" :size="60" v-if="time>0 && !hasReject">
    </a-spin>
    <div class="btn-container">
      <a-button class="btn" status="normal" type="primary" @click="handleCancel">取消</a-button>
      <a-button class="btn"  v-if="hasReject  || time<=0" status="normal" type="primary" @click="handleReuse">重试</a-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.tips {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-bottom: 20px;
  font-size: 16px;
  .text{
    margin-bottom: 10px;
  }
}
.btn-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  .btn{
    margin:10px 30px;
  }
}
</style>