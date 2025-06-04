import { ipcMain } from 'electron'
import { NetOptions } from './types'
import { http } from './http'
import { getNetworkSpeed, getNetworkType, netRequest } from './net'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initNet = () => {
  /**
   * 发起请求
   */
  ipcMain.handle('http', async (_event, options: NetOptions) => {
    return netRequest(options)
  })

  /**
   * 获取网络信息
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.handle('get-network-info', async (_event) => {
    const type = getNetworkType()
    const speed = await getNetworkSpeed()
    const latency = null
    return { type, speed, latency }
  })
}

export { initNet }
