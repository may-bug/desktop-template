import { app } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createNewWindow } from './window/windows'
import { initWindows } from './window'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { initTray } from './tray'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { initStore } from './store'
import { initSqlite } from './sqlite'
import { initLog } from './log'
import { initFile } from './file'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { store } from './store'
import { initUpdate } from './update'
import { initNet } from './net'

app.whenReady().then(async () => {
  /**
   * 创建菜单托盘
   */
  initTray()
  /**
   * 初始化存储
   */
  initStore()
  /**
   * 初始化进程间通信操作
   */
  initWindows()
  /**
   * 创建数据库
   */
  await initSqlite()
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
   * 初始化更新
   */
  initNet()
  /**
   * 设置app信息
   */
  electronApp.setAppUserModelId('cn.xf-studio')
  app.setName('讯飞工作室系统')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  /**
   * 判断是否为刚安装
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const welcome = store.get('welcome')
  if (welcome == undefined) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    store.set('welcome', false)
  }
  if (welcome) {
    createNewWindow('login', '登录', 321, 450, '/login', false, undefined)
  } else {
    createNewWindow('welcome', '欢迎', 800, 500, '/welcome', false, undefined)
  }

  // app.on('activate', function () {
  //   if (BrowserWindow.getAllWindows().length === 0) {
  //   }
  // })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
