/**
 * 创建窗口
 */
const createWindow = (
  id: string,
  title: string,
  width: number,
  height: number,
  url: string,
  resizable: boolean,
  parent: string | undefined
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  window.electron.ipcRenderer.send(
    'create-window',
    id, //id
    title, //标题
    width, //宽度
    height, //高度
    url, //打开的页面路径
    resizable, //可调整大小
    parent //父窗口
  )
}
/**
 * 创建工具栏窗口
 * @param id
 * @param title
 * @param width
 * @param height
 * @param url
 */
const createToolbarWindow = (
  id: string,
  title: string,
  width: number,
  height: number,
  url: string
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  window.electron.ipcRenderer.send(
    'create-window-toolbar',
    id, //id
    title, //标题
    width, //宽度
    height, //高度
    url //打开的页面路径
  )
}
/**
 * 创建悬浮球
 * @param id
 * @param size
 * @param defaultPosition
 */
const createFloatWindow = (
  id: string,
  size: number,
  defaultPosition?: { x: number; y: number }
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  window.electron.ipcRenderer.send(
    'create-window-toolbar',
    id, //id
    size,
    defaultPosition
  )
}

/**
 * 关闭窗口
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const closeWindow = (id: string) => {
  window.electron.ipcRenderer.send('close-window', id)
}

/**
 * 最大化窗口
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const hideWindow = (id: string) => {
  return window.electron.ipcRenderer.send('hide-window', id)
}

/**
 * 获取配置
 * Promise
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getConfig = async (key: string) => {
  return await window.electron.ipcRenderer.invoke('get-config', key)
}

/**
 * 存储配置
 * Promise
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const setConfig = async (key: string, value: unknown) => {
  return window.electron.ipcRenderer.invoke('set-config', key, value)
}

/**
 * 最大化窗口
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const maxWindow = (id: string) => {
  return window.electron.ipcRenderer.send('maximize-window', id)
}

/**
 * 最小化窗口
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const minWindow = (id: string) => {
  return window.electron.ipcRenderer.send('minimize-window', id)
}

/**
 * 最小化窗口
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const hideNotExitWindow = () => {
  return window.electron.ipcRenderer.send('all-hide-not-exit-window')
}

/**
 * 创建文件选择窗口
 * Promise
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createFileDialog = () => {
  return window.electron.ipcRenderer.invoke('create-file-dialog')
}

/**
 * 重置窗口
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const resetWindow = (id: string) => {
  return window.electron.ipcRenderer.send('restore-window', id)
}

/**
 * 退出应用
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const exitApp = () => {
  return window.electron.ipcRenderer.send('exit-app')
}

/**
 * 打开链接
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const openLink = (url: string) => {
  return window.electron.ipcRenderer.send('open-link', url)
}

/**
 * 悬浮球点击穿透
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const setFloatClickThrough = (data) => {
  return window.electron.ipcRenderer.send('set-float-click-through', data)
}
/**
 * 悬浮球拖拽
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const floatDrag = (data) => {
  return window.electron.ipcRenderer.send('float-drag', data)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const minimizeOthers=(id:string)=>{
  window.electron.ipcRenderer.send('minimize-others',id)
}

export {
  createWindow,
  closeWindow,
  hideWindow,
  resetWindow,
  maxWindow,
  minWindow,
  setConfig,
  getConfig,
  exitApp,
  openLink,
  hideNotExitWindow,
  createFileDialog,
  setFloatClickThrough,
  floatDrag,
  createToolbarWindow,
  createFloatWindow,
  minimizeOthers
}
