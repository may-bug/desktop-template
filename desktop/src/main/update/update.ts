import { autoUpdater } from 'electron-updater'
import { ipcMain } from 'electron'
import { logger } from '../log'

// 定义更新链接地址
const updateUrl = 'http://127.0.0.1:8089'

// 初始化更新
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const initUpdate = () => {
  autoUpdater.forceDevUpdateConfig = true // 强制使用开发环境进行更新
  autoUpdater.autoDownload = false // 设置自动下载更新
  autoUpdater.setFeedURL(updateUrl) // 设置更新地址
  autoUpdater.checkForUpdates().then((r) => {
    logger.info({ score: 'update', value: r })
  })
  // 检查更新
  autoUpdater.checkForUpdatesAndNotify().then((r) => logger.info({ score: 'update', value: r })) // 检查更新并通知
  // 注册更新过程中的各种事件
  autoUpdater.on('error', function (error: Error) {
    printUpdaterMessage('error')
    console.log(error)
  })

  autoUpdater.on('checking-for-update', function () {
    printUpdaterMessage('checking-for-update')
  })

  autoUpdater.on('update-available', function (info) {
    printUpdaterMessage('update-available')
    console.log(info)
  })

  autoUpdater.on('update-not-available', function (info) {
    printUpdaterMessage('update-not-available')
    console.log(info)
  })

  autoUpdater.on('download-progress', function (info) {
    printUpdaterMessage('download-progress')
    console.log(info)
  })

  autoUpdater.on('update-downloaded', function (info) {
    printUpdaterMessage('update-downloaded')
    setTimeout(() => {
      // 触发更新/向渲染进程发消息
      ipcMain.emit('has-update', true)
    }, 3000)
    console.log(info)
  })
}

// 打印更新过程中的消息
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function printUpdaterMessage(key: string) {
  const message = {
    error: '更新出错',
    'checking-for-update': '正在检查更新',
    'update-available': '检测到新版本',
    'download-progress': '下载中',
    'update-not-available': '无新版本',
    'update-downloaded': '新版本下载完成'
  }
  console.log('printUpdaterMessage', message[key])
}

// 安装更新
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const installUpdateApp = () => {
  console.log('update', 'installUpdateApp')
  autoUpdater.quitAndInstall() // 退出并安装更新
}
