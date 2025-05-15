// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const requestDesktopCapturePermission = () => {
  window.electron.ipcRenderer.send('request-desktop-capture-permission')
}

export { requestDesktopCapturePermission }
