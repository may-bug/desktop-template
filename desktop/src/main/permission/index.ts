import { session } from 'electron'
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initPermissionHandler = () => {
  //@ts-ignore
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    // const allowedPermissions = ['media', 'desktopCapture', 'notifications']
    // if (allowedPermissions.includes(permission)) {
      callback(true) // 允许权限
    // }
    //
    // const parsedUrl = new URL(webContents.getURL())
    //
    // // 验证 URL
    // if (parsedUrl.protocol !== 'https:' || parsedUrl.host !== 'example.com') {
    //   // 驳回权限请求
    //   return callback(false)
    // }
    // 启用桌面捕获
    // session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    //   callback(true) // 自动同意屏幕共享请求
    // })
    // dialog.showMessageBox(windowsContainer['main'], {
    //   title: '权限申请',
    //   message: `系统使用${permission}权限`
    // })
  })
}

export { initPermissionHandler }
