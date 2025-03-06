import { join } from 'path'
import { BrowserWindow, shell } from 'electron'
import icon from '../../../resources/icon.png?asset'
import { is } from '@electron-toolkit/utils'
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
    ...(process.platform === 'linux' ? { icon } : {}),
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

  newWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    newWindow.loadURL(`http://localhost:5173/#${url}`)
  } else {
    newWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: url })
  }
  windowsContainer[id] = newWindow
}
