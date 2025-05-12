<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getQrAPI, getUidAPI, qrPollingAPI } from '../../api/authQR'
import { useRequest } from 'vue-hooks-plus'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const props = defineProps({
  open: {
    type: Function
  }
})
const uid = ref()
const loading = ref(false)
const qrValue = ref()
const message = ref({
  text: '请使用APP扫码登录',
  style: 'info'
})
const load = ref(true)
const status = ref('wait')
/**
 * 获取二维码
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getQrValue = () => {
  load.value = true
  getQrAPI({ uid: uid.value }).then((res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (res.code === 200) {
      qrValue.value = res.data.image
      load.value = false
      polling.runAsync()
    }
  })
}
/**
 * 轮询请求
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getQrStatus = () => {
  qrPollingAPI({ uid: uid.value }).then((res) => {
    console.log(res.data.status)
    switch (res.data.status) {
      case 'expire':
        polling.cancel()
        status.value = 'expire'
        message.value = {
          text: '二维码过期',
          style: 'expire'
        }
        break
      case 'scan':
        status.value = 'scan'
        message.value = {
          text: '已扫描，请确认登录',
          style: 'success'
        }
        break
      case 'error':
        polling.cancel()
        status.value = 'error'
        message.value = {
          text: '系统错误,请稍后重试',
          style: 'error'
        }
        break
      case 'cancel':
        polling.cancel()
        status.value = 'cancel'
        message.value = {
          text: '登录请求被取消',
          style: 'cancel'
        }
        break
      case 'confirm':
        polling.cancel()
        setTimeout(() => {
          status.value = 'confirm'
          message.value = {
            text: '已确认登录',
            style: 'confirm'
          }
          loading.value = true
          setTimeout(() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            props.open()
            clearTimeout(this)
          }, 1000)
          clearTimeout(this)
        }, 1000)
        break
      case 'qr':
        break
      default:
        break
    }
  })
}
/**
 * 轮询
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const polling = useRequest(() => getQrStatus(), {
  manual: true,
  pollingInterval: 3000,
  pollingWhenHidden: false,
  pollingErrorRetryCount: -1
})
onMounted(() => {
  load.value = true
  getUidAPI().then((res) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (res.code == 200) {
      uid.value = res.data.uid
      getQrValue()
    }
  })
})
</script>

<template>
  <div class="qr-container">
    <div v-if="!loading" class="content">
      <div class="qr-pla">
        <div v-if="load" class="load-pla">
          <div class="load"></div>
        </div>
        <div v-else class="qr">
          <img alt="qr" :src="qrValue" />
        </div>
        <div v-if="status === 'confirm'" class="qr-overplay confirm">确认登录</div>
        <div v-if="status === 'error'" class="qr-overplay error">服务器错误</div>
        <div v-if="status === 'cancel'" class="qr-overplay cancel">取消登录</div>
        <div v-if="status === 'scan'" class="qr-overplay scan">扫描成功</div>
      </div>
      <div :class="`message ${message.style}`">{{ message.text }}</div>
    </div>
    <div v-else class="login-loading">
      <div class="loader"></div>
      <div class="text">登录中</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.qr-container {
  width: 100%;
  .login-loading {
    width: 100%;
    height: 400px;
    background: transparent;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .loader {
      width: 50px;
      padding: 8px;
      aspect-ratio: 1;
      border-radius: 50%;
      background: var(--color-primary);
      --_m: conic-gradient(#0000 10%, #000), linear-gradient(#000 0 0) content-box;
      -webkit-mask: var(--_m);
      mask: var(--_m);
      -webkit-mask-composite: source-out;
      mask-composite: subtract;
      animation: l3 1s infinite linear;
    }

    .text {
      margin-top: 10px;
    }
    @keyframes l3 {
      to {
        transform: rotate(1turn);
      }
    }
  }
  .qr-pla {
    position: relative;
    width: 100%;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 40px 0;

    .qr {
      width: 200px;
      height: 200px;

      img {
        border-radius: 10px;
      }
    }

    .qr-overplay {
      position: absolute;
      top: 0;
      margin: auto;
      border-radius: 10px;
      width: 200px;
      height: 200px;
      z-index: 4;
      backdrop-filter: blur(2px);
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .load-pla {
    width: 200px;
    height: 200px;
    background: white;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .load {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border-top: 3px solid var(--color-primary);
    border-right: 3px solid transparent;
    -webkit-animation: rotation 1s linear infinite;
    animation: rotation 1s linear infinite;
  }

  .message {
    margin-top: 20px;
    width: 100%;
    text-align: center;
  }
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
