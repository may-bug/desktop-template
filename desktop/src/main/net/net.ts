import { NetOptions } from './types'
import { net } from 'electron'
import * as os from 'node:os'
import si from 'systeminformation'
import { logger } from '../log'
import { exec } from 'child_process'
import bytes from 'bytes'
import { windowsContainer } from '../window/windows'

// 存储上一次获取到的网络接口数据，用于计算速度的差值
let lastNetworkStats = null

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const netRequest = (option: NetOptions) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const request = net.request(option)
    let Data = {}
    request.on('response', (response) => {
      console.log(`STATUS: ${response.statusCode}`)
      console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
      response.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`)
        Data = chunk
      })
      response.on('end', () => {
        console.log('No more data in response.')
        if (response.statusCode !== 200) {
          reject({
            response: {
              status: response.statusCode,
              data: Data
            }
          })
        }
        resolve(Data)
      })
    })
    request.end()
  })
}

/**
 * 获取网络类型
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getNetworkType = () => {
  const interfaces = os.networkInterfaces()
  for (const interfaceName in interfaces) {
    const iface = interfaces[interfaceName]
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    for (let i = 0; i < iface.length; i++) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const alias = iface[i]
      if (alias.family === 'IPv4' && !alias.internal) {
        return { name: interfaceName, type: alias.mac ? 'Ethernet or Wi-Fi' : 'Loopback' }
      }
    }
  }
  return null
}

/**
 * 测量网络延迟
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const ping = (host, callback) => {
  exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`)
      return callback(error)
    }
    console.log(`stdout: ${stdout}`)
    console.error(`stderr: ${stderr}`)
    callback(null, stdout)
  })
}

// 选择当前主用的网络接口（已启用、非虚拟接口且存在数据传输）
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const selectPrimaryInterface = (stats) => {
  return (
    stats.find(
      (iface) =>
        iface.operstate === 'up' && // 接口状态为启用（up）
        !iface.virtual && // 非虚拟网络接口
        (iface.rx_bytes > 0 || iface.tx_bytes > 0) // 存在数据传输
    ) || stats[0] // 若未找到符合条件的接口，则默认使用第一个接口
  )
}

// 周期性地获取网络接口数据并计算当前网速
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getNetworkSpeed = async (winId: string | undefined) => {
  const mainWindow = windowsContainer[winId === undefined ? 'main' : winId]
  try {
    // 获取系统中所有网络接口的统计信息
    const networkStatsArray = await si.networkStats()
    // 从接口列表中选择主网络接口
    const primaryIface = selectPrimaryInterface(networkStatsArray)
    // 确保上一次记录存在且接口未发生变化
    if (lastNetworkStats && primaryIface.iface === lastNetworkStats.iface) {
      // 计算上传与下载的速度（以字节每秒为单位）
      const uploadSpeed = primaryIface.tx_bytes - lastNetworkStats.tx_bytes
      const downloadSpeed = primaryIface.rx_bytes - lastNetworkStats.rx_bytes
      // 如果窗口存在并未被销毁，则向渲染进程发送速度数据
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('network-speed', {
          iface: primaryIface.iface, // 网络接口名称，如 Wi-Fi、eth0 等

          // 默认显示方式：自动转换合适单位（如 KB/s, MB/s）
          uploadSpeed: `${bytes(uploadSpeed)}/s`,
          downloadSpeed: `${bytes(downloadSpeed)}/s`

          // 备用实现方式，以 Mbps 为单位显示网速（默认注释）
          // uploadSpeed: `${((uploadSpeed * 8) / 1e6).toFixed(2)} Mbps`,
          // downloadSpeed: `${((downloadSpeed * 8) / 1e6).toFixed(2)} Mbps`,

          // 备用实现方式，以 Kbps 为单位显示网速（默认注释）
          // uploadSpeed: `${((uploadSpeed * 8) / 1e3).toFixed(2)} Kbps`,
          // downloadSpeed: `${((downloadSpeed * 8) / 1e3).toFixed(2)} Kbps`,
        })
      }
    }

    // 更新上一次的接口数据，以便下次计算速度差值
    lastNetworkStats = primaryIface
  } catch (error) {
    // 错误处理：记录错误信息并发送给渲染进程进行提示
    console.error('Error fetching network stats:', error)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('network-speed-error', error.message)
    }
  }
}

export { netRequest, getNetworkType, getNetworkSpeed, ping }
