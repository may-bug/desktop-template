/**
 * 获取捕获窗口信息
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getDesktopSources = () => {
  return window.electron.ipcRenderer.invoke('get-desktop-sources')
}

export { getDesktopSources }
