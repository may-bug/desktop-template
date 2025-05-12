import { logger } from './log'
import { ipcMain } from 'electron'
import { getLogLevels, LogQueryParams, readLogs } from './logReader'

interface LogOptions {
  type: 'error' | 'info' | 'warn'
  score: string
  value: string
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initLog = () => {
  /**
   * 日志打印
   */
  ipcMain.on('log', (_event, data: LogOptions) => {
    switch (data.type) {
      case 'error':
        logger.error({ model: 'renderer', score: data.score, value: data.value })
        break
      case 'warn':
        logger.warn({ model: 'renderer', score: data.score, value: data.value })
        break
      case 'info':
        logger.info({ model: 'renderer', score: data.score, value: data.value })
        break
      default:
        logger.info({ model: 'renderer', score: data.score, value: data.value })
        break
    }
  })

  /**
   * 获取日志
   */
  ipcMain.handle('query-logs', async (_, params: LogQueryParams) => {
    return await readLogs(params)
  })

  /**
   * 获取日志级别
   */
  ipcMain.handle('get-log-levels', async () => {
    return await getLogLevels()
  })
}
export { initLog, logger }
