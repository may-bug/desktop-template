/**
 * 获取捕获窗口信息
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getDesktopSources = () => {
  return window.electron.ipcRenderer.invoke('get-desktop-sources')
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getVideoSources = () => {
  return window.electron.ipcRenderer.invoke('get-desktop-sources')
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const stopVideoCapture = (sourceId: string) => {
  return window.electron.ipcRenderer.invoke('stop-video-capture', sourceId)
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const startVideoCapture = (sourceId: string) => {
  return window.electron.ipcRenderer.invoke('start-video-capture', sourceId)
}

export { getDesktopSources, getVideoSources, stopVideoCapture, startVideoCapture }
