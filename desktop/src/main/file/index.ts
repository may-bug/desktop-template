import { createFileDialog } from './io'
import { ipcMain } from 'electron'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initFile=()=>{
  /**
   * 创建选择文件窗口
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.handle('create-file-dialog', (_event) => {
    return createFileDialog({
      title: 'Create File'
    })
  })
}

export { initFile }
