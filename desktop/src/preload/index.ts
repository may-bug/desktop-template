import { contextBridge, ipcRenderer } from 'electron'

// 自定义 API 暴露给渲染进程
const api = {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  send: (channel: string, ...data) => {
    return ipcRenderer.send(channel, ...data)
  },
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  on: (channel, listener) => ipcRenderer.on(channel, listener),
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  once: (channel, listener) => ipcRenderer.once(channel, listener),
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  invoke: (channel: string, ...data) => {
    return ipcRenderer.invoke(channel, ...data)
  }
}

// 安全暴露 API
if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
      send: api.send,
      on: api.on,
      once: api.once,
      invoke: api.invoke,
      removeAllListeners: api.removeAllListeners
    }
  })
} else {
  // @ts-ignore 非隔离环境下的回退方案
  window.electron = { ipcRenderer: api }
}
