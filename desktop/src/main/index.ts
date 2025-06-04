import { app } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createNewWindow } from './window/windows'
import { initWindows } from './window'
import { initTray } from './tray'
import { initStore } from './store'
import { initSqlite } from './sqlite'
import { initLog } from './log'
import { initFile } from './file'
import { initUpdate } from './update'
import { initNet } from './net'
import { initPermissionHandler } from './sys'
import { initClipboard } from './clipboard'
import { initMessage } from './message'

/**
 * 开启进程沙盒化
 */
app.enableSandbox()
app.whenReady().then(async () => {
  /**
   * 设置app信息
   */
  electronApp.setAppUserModelId('org.codelin.desktop')
  app.setName('codelin')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  createNewWindow('login', '登录', 321, 450, '/login', false, undefined)
  initApp()
})
/**
 * 各类IPCMain通道注册
 */
const initApp: void = async () => {
  /**
   * 初始化进程间通信操作
   */
  initWindows()
  /**
   * 创建数据库
   */
  await initSqlite()
  /**
   * 注册权限请求
   */
  initPermissionHandler()
  /**
   * 创建菜单托盘
   */
  initTray()
  /**
   * 初始化存储
   */
  initStore()
  /**
   * 初始化文件操作
   */
  initFile()
  /**
   * 初始化信息打印
   */
  initLog()
  /**
   * 初始化更新
   */
  initUpdate()
  /**
   * 初始化网络信息模块
   */
  initNet()
  /**
   * 剪贴板
   */
  initClipboard()
  /**
   * 消息订阅
   */
  initMessage()
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
