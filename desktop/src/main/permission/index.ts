import { session, ipcMain, Notification } from 'electron'
import os from 'os'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initPermissionHandler = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true)
    new Notification('权限使用', {
      body: `系统使用${permission}权限`
    }).show()
  })

  /**
   * 获取系统的平台
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.handle('get-platform', (_event) => {
    return os.type()
  })
}

export { initPermissionHandler }
