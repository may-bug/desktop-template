import { clipboard, nativeImage } from 'electron'
import { ipcMain } from 'electron'

/**
 * 剪贴板复制
 */
const initClipboard: object = () => {
  ipcMain.handle('copy-image-to-clipboard', async (event, imageData) => {
    try {
      const image = nativeImage.createFromDataURL(imageData)
      clipboard.writeImage(image)
      return { success: true }
    } catch (error) {
      console.error('复制到剪贴板失败:', error)
      return { success: false, error: error.message }
    }
  })
}
export { initClipboard }
