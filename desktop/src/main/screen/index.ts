import { desktopCapturer, ipcMain} from 'electron';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initScreen = () => {
  /**
   *  处理获取桌面源的请求
   */
  ipcMain.handle('get-desktop-sources', async () => {
    return await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 1024, height: 768 }
    })
  })

  /**
   * 处理权限请求
   */
  ipcMain.on('request-desktop-capture-permission', () => {
    // Electron会自动处理权限请求
  })
}

export { initScreen }
