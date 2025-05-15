import { Message } from '@arco-design/web-vue'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const requestDesktopCapturePermission = () => {
  window.electron.ipcRenderer.send('request-desktop-capture-permission')
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const openSystemPreferences = () => {
  window.electron.ipcRenderer.send('request-desktop-capture-permission')
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const showPermissionError = () => {
  Message.error(`无法访问屏幕录制权限，请按以下步骤操作：
    1. 打开系统设置 → 安全性与隐私 → 隐私
    2. 选择屏幕录制
    3. 勾选您的应用程序
    注意：在macOS Catalina(10.15)及以上版本需要手动授权。
  `)

  if (process.platform === 'darwin') {
    openSystemPreferences()
  }
}

export { requestDesktopCapturePermission,showPermissionError }
