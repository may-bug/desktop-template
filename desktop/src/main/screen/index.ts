import { desktopCapturer, ipcMain } from 'electron'
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initScreen = () => {
  /**
   *  处理获取桌面源的请求
   */
  ipcMain.handle('get-desktop-sources', async () => {
    return await desktopCapturer.getSources({
      types: ['screen']
    })
  })
}

export { initScreen }
