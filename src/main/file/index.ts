import { createFileDialog, deleteFile, readFile, saveFile } from './io'
import { ipcMain } from 'electron'

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
   * 创建文件
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  ipcMain.handle('save-file', (_event, content, filePath) => {
    return saveFile(filePath, filePath)
  })

  /**
   * 删除文件
   */
  ipcMain.handle('delete-file', (_event, filePath: string) => {
    return deleteFile(filePath)
  })

  /**
   * 读取文件
   */
  ipcMain.handle('db-update', async (_event, filePath: string) => {
    return readFile(filePath)
  })
}

export { initFile }
