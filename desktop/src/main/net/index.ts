import { ipcMain } from 'electron'
import { NetOptions } from './types'
import { getNetworkSpeed, getNetworkType, netRequest } from './net'

let timer = undefined

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initNet = () => {
  /**
   * 发起请求
   */
  ipcMain.handle('http', async (_event, options: NetOptions) => {
    return netRequest(options)
  })

  /**
   * 启动监听实时网络流动
   */
  ipcMain.on('network-speed-listen-start', async (_event, winId: string | undefined) => {
    timer = setInterval(() => {
      getNetworkSpeed(winId)
    }, 1000)
  })

  /**
   * 获取网络类型
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.handle('get-network-type', async (_event) => {
    return getNetworkType()
  })

  /**
   * 启动监听实时网络流动
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.on('network-speed-listen-stop', async (_event) => {
    clearInterval(timer)
  })
}

export { initNet }
