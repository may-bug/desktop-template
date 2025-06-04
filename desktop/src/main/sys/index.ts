import { session, ipcMain, Notification, powerSaveBlocker } from 'electron'
import os from 'os'

let powerSaveBlockerId: string = ''

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initPermissionHandler = () => {
  /**
   * 权限提示
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(true)
    new Notification('权限使用', {
      body: `系统使用${permission}权限`
    }).show()
  })

  /**
   * 阻止屏幕休眠
   * @param type 'closed' | 'prevent-app-suspension' | 'prevent-display-sleep'
   */
  ipcMain.handle(
    'change-power-save-blocker',
    async (_event, type: 'closed' | 'prevent-app-suspension' | 'prevent-display-sleep') => {
      if (type === 'prevent-app-suspension') {
        powerSaveBlockerId = powerSaveBlocker.start('prevent-app-suspension')
        return powerSaveBlockerId
      }
      if (type === 'prevent-display-sleep') {
        powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep')
        return powerSaveBlockerId
      } else {
        powerSaveBlocker.stop(powerSaveBlockerId)
        return
      }
    }
  )

  /**
   * 获取系统的平台
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.handle('get-platform', (_event) => {
    return os.type()
  })
}

export { initPermissionHandler }
