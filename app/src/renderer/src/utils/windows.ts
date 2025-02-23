export const closeWindow = (windowId:string): void => {
  window.electron.ipcRenderer.send('close-window', windowId)
}

export const hideWindow = (windowId:string): void => {
  window.electron.ipcRenderer.send('hide-window', windowId)
}

export const maxWindow = (windowId:string): void => {
  window.electron.ipcRenderer.send('maximize-window', windowId)
}

export const minWindow = (windowId:string): void => {
  window.electron.ipcRenderer.send('minimize-window', windowId)
}

export const resetWindow = (windowId:string): void => {
  window.electron.ipcRenderer.send('restore-window', windowId)
}