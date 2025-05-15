import { app, ipcMain } from 'electron'
import { shell } from 'electron'
import { createNewWindow, windowsContainer } from './windows'
import { logger } from '../log'
import * as url from 'node:url'

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

  //最大化窗口
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
   * 退出应用
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.on('exit-app', async (_event) => {
    app.quit()
  })
}

export { initWindows }
