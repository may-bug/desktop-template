
import { ipcMain } from 'electron'
import { installUpdateApp } from './update'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initUpdate = () => {
  /**
   * 更新
   */
  ipcMain.handle('install-update-app', () => {
    installUpdateApp()
  })
}

export { initUpdate }
