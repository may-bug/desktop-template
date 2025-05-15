import { createFileDialog } from './io'
import { app, dialog, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initFile = () => {
  /**
   * 创建选择文件窗口
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.handle('create-file-dialog', (_event) => {
    return createFileDialog({
      title: 'Create File'
    })
  })

  /**
   * 保存图片
   */
  ipcMain.handle('file-save-image', async (event, imageData) => {
    try {
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      const filePath = path.join(app.getPath('pictures'), `screenshot-${Date.now()}.png`)
      fs.writeFileSync(filePath, buffer)
      return { success: true, path: filePath }
    } catch (error) {
      console.error('保存图片失败:', error)
      return { success: false, error: error.message }
    }
  })

  /**
   * 保存视频
   */
  ipcMain.handle('file-save-recording', async (event, buffer) => {
    try {
      const { filePath } = await dialog.showSaveDialog({
        title: '保存录制视频',
        defaultPath: path.join(app.getPath('videos'), `recording-${Date.now()}.webm`),
        filters: [
          { name: 'WebM Videos', extensions: ['webm'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (filePath) {
        fs.writeFileSync(filePath, Buffer.from(buffer))
        return { success: true, path: filePath }
      }
      return { success: false }
    } catch (error) {
      console.error('保存录制失败:', error)
      return { success: false, error: error.message }
    }
  })
}

export { initFile }
