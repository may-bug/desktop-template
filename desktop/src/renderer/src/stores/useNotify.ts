import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface NotifyMessage {
  id: string
  title: string
  html: string
  timeout?: number
}

export const useNotify = defineStore('notify', () => {
  const queue = ref<NotifyMessage[]>([])
  const current = ref<NotifyMessage | null>(null)
  const timer = ref<ReturnType<typeof setTimeout> | null>(null)

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const add = (msg: NotifyMessage) => {
    queue.value.push(msg)
    if (!current.value) next()
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const next = () => {
    if (timer.value) clearTimeout(timer.value)

    const nextMsg = queue.value.shift()
    if (!nextMsg) {
      current.value = null
      return
    }

    current.value = nextMsg
    timer.value = setTimeout(() => {
      current.value = null
      next()
    }, nextMsg.timeout ?? 3000)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const clear = () => {
    queue.value = []
    current.value = null
    if (timer.value) clearTimeout(timer.value)
  }

  return {
    queue,
    current,
    add,
    next,
    clear
  }
})
