import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDataStore = defineStore('data', () => {
  const token = ref<string>()
  const uid = ref<string>()
  const deviceId=ref<string>()
  const toDeviceId=ref<string>()
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const setToken = (val: string) => {
    token.value = val
  }
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const setUid = (val: string) => {
    uid.value = val
  }
  const setDeviceId = (val: string) => {
    deviceId.value = val
  }
  const setToDeviceId=(val:string) => {
    toDeviceId.value = val
  }
  return {
    token,
    uid,
    deviceId,
    toDeviceId,
    setToDeviceId,
    setDeviceId,
    setToken,
    setUid
  }
},{
  persist: {
    enabled: true,
  },
})
