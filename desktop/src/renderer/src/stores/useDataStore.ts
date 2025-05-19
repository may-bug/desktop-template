import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useDataStore=defineStore("data",()=>{
  const token=ref<String>()
  const uid=ref<String>()
  const setToken=(val:string)=>{
    token.value=val
  }
  const setUid=(val:string)=>{
    token.value=val
  }
  return{
    token,
    uid,
    setToken,
    setUid
  }
})