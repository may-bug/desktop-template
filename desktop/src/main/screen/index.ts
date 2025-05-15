import { desktopCapturer, ipcMain, nativeImage } from 'electron'
import { captureService } from './DesktopCaptureService'
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

  ipcMain.handle('capture-desktop-source', async (_, sourceId: string) => {
    const image = await captureService.captureSource(sourceId);
    return image.toDataURL() // 返回base64编码的图像数据
  })

  ipcMain.handle('save-desktop-capture', async (_, { dataUrl, filePath }) => {
    const image = nativeImage.createFromDataURL(dataUrl)
    await captureService.saveCapture(image, filePath)
    return { success: true, path: filePath }
  })
}

export { initScreen }
