import { join } from 'path'
import { app, BrowserWindow, dialog, shell, screen } from 'electron'
import icon from '../../../resources/icon.png?asset'
import { is } from '@electron-toolkit/utils'
import { logger } from '../log'

const notificationQueue: NotifyWindowParams[] = []
let notifyWindow: BrowserWindow | null = null
const windowsContainer: { [key: string]: BrowserWindow } = {}
let isShowing = false

// 工具栏窗口参数类型
interface NotifyWindowParams {
  title: string
  width: number
  height: number
  timeout: number
}

// 工具栏窗口参数类型
interface ToolbarWindowParams {
  title: string
  width: number
  height: number
}

// 悬浮球窗口参数类型
interface FloatWindowParams {
  id: string
  size: number // 悬浮球尺寸
  defaultPosition?: { x: number; y: number } // 默认显示位置
}

// 创建工具栏窗口（自动最小化其他窗口）
const createToolbarWindow = (params: ToolbarWindowParams): void => {
  // 最小化所有现有窗口
  BrowserWindow.getAllWindows().forEach((win) => {
    if (!win.isDestroyed() && win !== windowsContainer['toolbar']) {
      win.minimize()
    }
  })
  const margin = 10
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const win = new BrowserWindow({
    title: params.title,
    width: params.width,
    height: params.height,
    x: width - params.width - margin,
    y: height - params.height - margin,
    transparent: false,
    icon: icon,
    frame: false,
    resizable: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // 加载页面
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`http://localhost:5173/#/toolbar`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/toolbar' })
  }
  win.on('ready-to-show', () => {
    win.show()
  })
  win.on('close', () => {
    delete windowsContainer['toolbar']
  })
  windowsContainer['toolbar'] = win
}

/**
 * 解决导出问题
 */
const setNotifyShow: void = (val: boolean) => {
  isShowing = val
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const showNextNotify = () => {
  if (notificationQueue.length === 0) {
    isShowing = false
    if (notifyWindow) {
      notifyWindow.hide()
    }
    return
  }

  isShowing = true
  const params = notificationQueue.shift()!
  if (!notifyWindow) {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize
    const margin = 10

    notifyWindow = new BrowserWindow({
      title: params.title,
      width: params.width,
      height: params.height,
      x: width - params.width - margin,
      y: height - params.height - margin,
      frame: false,
      icon,
      alwaysOnTop: true,
      resizable: false,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        nodeIntegration: false,
        contextIsolation: true
      }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      notifyWindow.loadURL(`http://localhost:5173/#/notify`)
    } else {
      notifyWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/notify' })
    }

    // 只绑定一次，确保每次页面加载完成时都会发事件
    notifyWindow.webContents.on('did-finish-load', () => {
      notifyWindow.webContents.send('notify-reset')
    })
  }
  notifyWindow.webContents.send('notify-reset')
  notifyWindow.setBounds({
    width: params.width,
    height: params.height,
    x: screen.getPrimaryDisplay().workAreaSize.width - params.width - 10,
    y: screen.getPrimaryDisplay().workAreaSize.height - params.height - 10
  })
  notifyWindow.show()
  notifyWindow.focus()
  setTimeout(
    () => {
      notifyWindow?.hide()
      showNextNotify()
    },
    params.timeout || 60 * 1000
  )
}
// 通知弹窗
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createNotifyWindow = (params: NotifyWindowParams) => {
  notificationQueue.push(params)
  if (!isShowing) {
    showNextNotify()
  }
}

/**
 * 创建悬浮球窗口（可拖拽、穿透点击）
 */
const createFloatWindow = (params: FloatWindowParams): void => {
  const display = screen.getPrimaryDisplay()
  const defaultPos = params.defaultPosition || {
    x: display.workAreaSize.width - params.size - 20,
    y: display.workAreaSize.height - params.size - 20
  }

  const win = new BrowserWindow({
    width: params.size,
    height: params.size,
    x: defaultPos.x,
    y: defaultPos.y,
    transparent: false,
    focusable: false,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enablePreferredSizeMode: true
    }
  })

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('init-click-through', false) // 明确初始状态
  })

  // 加载悬浮球界面
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`http://localhost:5173/#/float`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/float' })
  }

  // 实现全窗口拖拽（右键拖拽）
  let isDragging = false
  let lastPosition = { x: 0, y: 0 }

  win.webContents.on('before-input-event', (_, input) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (input.type === 'mouseDown' && input.button === 'right') {
      isDragging = true
      lastPosition = screen.getCursorScreenPoint()
    }
  })

  win.webContents.on('input-event', (_, input) => {
    if (isDragging && input.type === 'mouseMove') {
      const newPos = screen.getCursorScreenPoint()
      const deltaX = newPos.x - lastPosition.x
      const deltaY = newPos.y - lastPosition.y
      const [winX, winY] = win.getPosition()
      win.setPosition(winX + deltaX, winY + deltaY)
      lastPosition = newPos
    }

    if (input.type === 'mouseUp') {
      isDragging = false
    }
  })

  // 允许被其他窗口覆盖
  win.setAlwaysOnTop(true, 'normal')
  win.on('blur', () => win.setAlwaysOnTop(false))
  win.on('focus', () => win.setAlwaysOnTop(true))

  windowsContainer[params.id] = win
}

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
const createNewWindow = (
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    icon: icon,
    width: width,
    height: height,
    darkTheme: true,
    frame: false,
    parent: parent,
    transparent: false,
    hasShadow: true,
    modal: parent !== undefined && parent !== null,
    resizable: resizable,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  })

  newWindow.on('ready-to-show', () => {
    newWindow.show()
  })

  newWindow.webContents.on('render-process-gone', (e, details) => {
    console.error('渲染进程崩溃:', {
      reason: details.reason,
      exitCode: details.exitCode,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      stack: details.stack
    })
    const options = {
      type: 'error',
      title: '进程崩溃了',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      message: `这个进程已经崩溃.\n'
      reason: ${details.reason},
      exitCode: ${details.exitCode},
      stack: ${details.stack}`,
      buttons: ['重试', '关闭']
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    dialog.showMessageBox(windowsContainer[id], options).then(({ response }) => {
      if (response === 0) reloadWindow(id)
      else app.quit()
    })
  })

  newWindow.webContents.setWindowOpenHandler((details) => {
    shell
      .openExternal(details.url)
      .then(() => {
        logger.info({ model: 'main', score: 'sys', value: `openHandler ${details.url}` })
      })
      .catch((e) => {
        logger.error({
          model: 'main',
          score: 'sys',
          value: `openHandler ${details.url} cause ${e.message}`
        })
      })
    return { action: 'deny' }
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    newWindow.loadURL(`http://localhost:5173/#${url}`)
  } else {
    newWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: url })
  }
  windowsContainer[id] = newWindow
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const reloadWindow = (id: string) => {
  windowsContainer[id].reload()
}

export {
  createNewWindow,
  createFloatWindow,
  createToolbarWindow,
  createNotifyWindow,
  windowsContainer,
  notificationQueue,
  notifyWindow,
  showNextNotify,
  setNotifyShow
}
