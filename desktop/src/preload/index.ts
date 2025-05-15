// import { contextBridge } from 'electron'
// import { electronAPI } from '@electron-toolkit/preload'
//
// const api = {}
//
// if (process.contextIsolated) {
//   try {
//     contextBridge.exposeInMainWorld('electron', electronAPI)
//     contextBridge.exposeInMainWorld('api', api)
//   } catch (error) {
//     console.error(error)
//   }
// } else {
//   // @ts-ignore (define in dts)
//   window.electron = electronAPI
//   // @ts-ignore (define in dts)
//   window.api = api
// }
import { contextBridge, ipcRenderer } from 'electron';

// 自定义 API 暴露给渲染进程
const api = {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  send: (channel: string, ...data) => {
    return ipcRenderer.send(channel, ...data)
  },
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  on: (channel: string, ...data) => {
    return ipcRenderer.on(channel, ...data)
  },
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
      invoke: api.invoke
    }
  });
} else {
  // @ts-ignore 非隔离环境下的回退方案
  window.electron = { ipcRenderer: api }
}
