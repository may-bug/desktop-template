import { logger } from './log'
import { app, ipcMain } from 'electron'
import {
  filterLogs,
  getLogDir,
  getLogFiles,
  LogEntry,
  LogQueryParams,
  LogResponse,
  paginateLogs,
  readLogFile,
  sortLogs
} from './logReader'
import path from 'path'

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

  // 读取日志
  ipcMain.handle('logs-read', async (_, params: never) => {
    try {
      const queryParams: LogQueryParams = {
        ...params,
        startDateTime: params.startDateTime ? new Date(params.startDateTime) : undefined,
        endDateTime: params.endDateTime ? new Date(params.endDateTime) : undefined
      }

      const logFiles = await getLogFiles(queryParams.sort)
      const allEntries: LogEntry[] = []

      for (const file of logFiles) {
        const filePath = path.join(getLogDir(), file)
        const entries = await readLogFile(filePath)
        allEntries.push(...entries)
      }

      const filtered = filterLogs(allEntries, queryParams)
      const sorted = sortLogs(filtered, queryParams.sort)
      const { logs, total } = paginateLogs(sorted, queryParams.page, queryParams.size)

      return {
        logs,
        total,
        page: queryParams.page || 1,
        size: queryParams.size || 20
      } as LogResponse
    } catch (error) {
      logger.error(`处理日志查询失败: ${error.message}`)
      throw error
    }
  })

  // 获取日志级别
  ipcMain.handle('logs-levels', async () => {
    const logFiles = await getLogFiles()
    const levels = new Set<string>()

    for (const file of logFiles.slice(0, 3)) {
      const filePath = path.join(getLogDir(), file)
      const entries = await readLogFile(filePath)
      entries.slice(0, 100).forEach((entry) => levels.add(entry.level))
    }

    return Array.from(levels).sort()
  })

  // 获取日志文件列表
  ipcMain.handle('logs-files', async (_, sort: 'asc' | 'desc') => {
    return getLogFiles(sort)
  })

  /**
   * 导出日志
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ipcMain.handle('logs-export', async (_) => {
    return path.join(app.getPath('downloads'), `logs_${Date.now()}.txt`)
  })
}
export { initLog, logger }
