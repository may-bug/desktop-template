import { logger } from './log'
import { ipcMain } from 'electron'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initLog = () => {
  /**
   * 日志打印
   */
  ipcMain.on('log', (_event, type, value) => {
    switch (type) {
      case 'error':
        logger.error(value)
        break
      case 'warn':
        logger.warn(value)
        break
      default:
        logger.info(value)
        break
    }
  })
}
export { initLog }
