import { NetOptions } from './types'
import { net } from 'electron'
import * as os from 'node:os'
import si from 'systeminformation'
import { logger } from '../log/log'
import { exec } from 'child_process'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const netRequest = (options: NetOptions) => {
  return new Promise((resolve, reject) => {
    try {
      let result
      const request = net.request(options)
      request.on('response', (response) => {
        console.log(`STATUS: ${response.statusCode}`)
        console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
        result = response
        response.on('data', (body) => {
          console.log(`BODY: ${body}`)
        })
        response.on('end', () => {
          console.log('No more data in response.')
        })
        resolve(result)
      })
      request.end()
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      reject(error)
    }
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
 * 获取网速
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getNetworkSpeed = async () => {
  const networkStats = await si.networkStats()
  logger.info(networkStats)
  // 输出将包含每个网络接口的rx_bytes(接收字节数)和tx_bytes(发送字节数)
  return networkStats
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

export { netRequest, getNetworkType, getNetworkSpeed, ping }
