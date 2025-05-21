import { app, BrowserWindow, ipcMain } from 'electron'
import { shell } from 'electron'
import {
  createFloatWindow,
  createNewWindow,
  createNotifyWindow,
  createToolbarWindow,
  notificationQueue,
  notifyWindow,
  setNotifyShow,
  showNextNotify,
  windowsContainer
} from './windows'
import { logger } from '../log'
import * as url from 'node:url'

/**
 * 创建窗口IPC
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initWindows = () => {
  //创建普通窗口
  ipcMain.on(
    'create-window',
    (
      _event,
      id: string,
      title: string,
      width: number,
      height: number,
      url: string,
      resizable: boolean,
      parent: string | undefined
    ) => {
      if (windowsContainer[id] === undefined || windowsContainer[id].isDestroyed())
        createNewWindow(
          id,
          title,
          width,
          height,
          url,
          resizable,
          parent ? windowsContainer[parent] : undefined
        )
      else {
        // 将窗口设置为最顶层并聚焦
        windowsContainer[id].setAlwaysOnTop(true)
        windowsContainer[id].focus()
        setTimeout(() => {
          windowsContainer[id].setAlwaysOnTop(false)
        }, 500)
      }
    }
  )

  //显示窗口
  ipcMain.on('show-window', (_event, id: string) => {
    windowsContainer[id].show()
  })

  //关闭窗口
  ipcMain.on('close-window', (_event, id: string) => {
    windowsContainer[id].close()
    windowsContainer[id].destroy()
    // if (windowsContainer['main'].isDestroyed()) {
    //   app.quit()
    // }
  })

  //隐藏窗口
  ipcMain.on('hide-window', (_event, id: string) => {
    windowsContainer[id].hide()
  })

  //重新加载窗口
  ipcMain.on('reload-window', (_event, id: string) => {
    windowsContainer[id].reload()
  })

  //还原窗口状态
  ipcMain.on('restore-window', (_event, id: string) => {
    windowsContainer[id].restore()
  })

  //最小化窗口
  ipcMain.on('minimize-window', (_event, id: string) => {
    windowsContainer[id].minimize()
  })
  /**
   * 最大化窗口
   */
  ipcMain.on('maximize-window', (_event, id: string) => {
    windowsContainer[id].maximize()
  })

  //关闭所有窗口但保留后台
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.on('all-hide-not-exit-window', (_event) => {
    // for (const winKey in windowsContainer) {
    //   if (Object.prototype.hasOwnProperty.call(windowsContainer, winKey)) {
    //     const win = windowsContainer[winKey];
    //     if (!win.isDestroyed()) {
    //       win.setSkipTaskbar(true)
    //       win.hide()
    //     }
    //   }
    // }
  })

  /**
   * 打开外部链接
   */
  ipcMain.on('open-link', (_event, link: string) => {
    shell
      .openExternal(link)
      .then(() => logger.info({ score: 'sys', value: `open link ${url}` }))
      .catch((err) =>
        logger.error({ score: 'sys', value: `open link ${url} cause ${err.message}` })
      )
  })

  /**
   * 打开系统设置
   */
  ipcMain.handle('openSystemPreferences', () => {
    if (process.platform === 'darwin') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('child_process').exec(
        'open "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenRecording"'
      )
    } else if (process.platform === 'win32') {
      console.log('windows')
    }
  })
  /**
   * 工具栏窗口 IPC 处理
   */
  ipcMain.handle('toolbar-drag', (event, deltaX, deltaY) => {
    const win = BrowserWindow.fromWebContents(event.sender)!
    const [x, y] = win.getPosition()
    win.setPosition(x + deltaX, y + deltaY)
  })
  /**
   * 创建通知栏窗口
   */
  ipcMain.on(
    'create-window-notify',
    (event, title: string, width: number, height: number, timeout: number) => {
      createNotifyWindow({ title: title, width: width, height: height, timeout: timeout })
    }
  )
  /**
   * 创建工具栏窗口
   */
  ipcMain.on('create-window-toolbar', (event, title: string, width: number, height: number) => {
    createToolbarWindow(title, width, height)
  })
  /**
   * 创建悬浮球
   */
  ipcMain.on(
    'create-window-float',
    (event, id: string, size: number, defaultPosition?: { x: number; y: number }) => {
      createFloatWindow(id, size, defaultPosition)
    }
  )
  /**
   * 最小化其它窗口
   */
  ipcMain.on('minimize-others', (event, id) => {
    const currentWindow = windowsContainer[id]
    minimizeOtherWindows(currentWindow)
  })
  /**
   * 悬浮球窗口拖拽
   */
  ipcMain.handle('float-drag', (event, { screenX, screenY }) => {
    const win = BrowserWindow.fromWebContents(event.sender)!
    const display = screen.getDisplayNearestPoint({ x: screenX, y: screenY })
    // 计算边界
    const maxX = display.bounds.x + display.bounds.width - win.getSize()[0]
    const maxY = display.bounds.y + display.bounds.height - win.getSize()[1]
    const clampedX = Math.max(display.bounds.x, Math.min(screenX, maxX))
    const clampedY = Math.max(display.bounds.y, Math.min(screenY, maxY))
    console.log('New Position:', clampedX, clampedY)
    win.setPosition(clampedX, clampedY, true)
  })
  /**
   * 悬浮球点击穿透
   */
  ipcMain.handle('float-set-click-through', (event, enabled) => {
    const win = BrowserWindow.fromWebContents(event.sender)!
    win.setIgnoreMouseEvents(enabled, {
      forward: true
    })
  })
  /**
   * 通用窗口管理
   */
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function minimizeOtherWindows(currentWindow: BrowserWindow) {
    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed() && win !== currentWindow) {
        win.minimize()
      }
    })
  }
  /**
   * 退出应用
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.on('exit-app', async (_event) => {
    app.quit()
  })

  /**
   * 通知窗口操作
   */
  ipcMain.on('notify-close', () => {
    if (notifyWindow && !notifyWindow.isDestroyed()) {
      notifyWindow.hide()
      showNextNotify()
    }
  })

  /**
   * 忽略所有通知
   */
  ipcMain.on('notify-clear-all', () => {
    notificationQueue.length = 0
    if (notifyWindow && !notifyWindow.isDestroyed()) {
      notifyWindow.hide()
    }
    setNotifyShow(false)
  })
}

export { initWindows }
