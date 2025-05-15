import { session } from 'electron'
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initPermissionHandler = () => {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'desktopCapture') {
      callback(true) // 允许桌面捕获
    } else {
      callback(false)
    }
  })
}

export { initPermissionHandler }
