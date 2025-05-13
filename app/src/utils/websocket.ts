// src/utils/websocket.ts
import { ref } from 'vue'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useWebSocket(url: string) {
  const socket = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const error = ref<Error | null>(null)

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const connect = () => {
    return new Promise<void>((resolve, reject) => {
      try {
        socket.value = new WebSocket(url)

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        socket.value.onopen = () => {
          isConnected.value = true
          resolve()
        }

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        socket.value.onerror = (err) => {
          error.value = new Error('WebSocket error')
          isConnected.value = false
          reject(err)
        }

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        socket.value.onclose = () => {
          isConnected.value = false
        }
      } catch (err) {
        error.value = err as Error
        reject(err)
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const send = (data: unknown) => {
    if (socket.value && isConnected.value) {
      socket.value.send(JSON.stringify(data))
    } else {
      throw new Error('WebSocket is not connected')
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
      socket.value = null
      isConnected.value = false
    }
  }

  return {
    socket,
    isConnected,
    error,
    connect,
    send,
    disconnect
  }
}
