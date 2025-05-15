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
  // 设置内容安全策略
  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //   callback({
  //     responseHeaders: {
  //       ...details.responseHeaders,
  //       'Content-Security-Policy': [
  //         "default-src 'self' 'unsafe-inline'",
  //         "media-src 'self' blob:",
  //         "connect-src 'self' ws://localhost:*"
  //       ]
  //     }
  //   })
  // })
}

export { initPermissionHandler }
