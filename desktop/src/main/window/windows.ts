import { join } from 'path'
import { app, BrowserWindow, dialog, shell } from 'electron'
import icon from '../../../resources/icon.png?asset'
import { is } from '@electron-toolkit/utils'
import { logger } from '../log'

export const windowsContainer: { [key: string]: BrowserWindow } = {}

/**
 * 创建窗口
 * @param id 窗口id
 * @param title 窗口标题
 * @param width 窗口宽度
 * @param height 窗口高度
 * @param url 页面utl
 * @param resizable 是否可拖动调整大小
 * @param parent 父窗口
 */
export const createNewWindow = (
  id: string,
  title: string,
  width: number,
  height: number,
  url: string,
  resizable: boolean,
  parent: BrowserWindow | undefined
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  const newWindow = new BrowserWindow({
    title: title,
    icon: icon,
    width: width,
    height: height,
    darkTheme: true,
    show: false,
    frame: false,
    parent: parent,
    modal: parent !== undefined && parent !== null,
    resizable: resizable,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  })

  newWindow.on('ready-to-show', () => {
    newWindow.show()
  })

  newWindow.webContents.on('render-process-gone', (e, details) => {
    const options = {
      type: 'error',
      title: '进程崩溃了',
      message: '这个进程已经崩溃.',
      buttons: ['重载', '退出']
    }
    recordCrash(details)
      .then(() => {
        dialog.showMessageBox(options).then(({ response }) => {
          console.log(response)
          if (response === 0) reloadWindow()
          else app.quit()
        })
      })
      .catch((e) => {
        logger.error({ score: 'sys', value: e.message })
      })
  })

  newWindow.webContents.setWindowOpenHandler((details) => {
    shell
      .openExternal(details.url)
      .then(() => {
        logger.info({ score: 'sys', value: `openHandler ${details.url}` })
      })
      .catch((e) => {
        logger.error({ score: 'sys', value: `openHandler ${details.url} cause ${e.message}` })
      })
    return { action: 'deny' }
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    newWindow.loadURL(`http://localhost:5173/#${url}`).then(() => {})
  } else {
    newWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: url }).then(() => {})
  }
  windowsContainer[id] = newWindow
}
