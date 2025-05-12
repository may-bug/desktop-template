import fs from 'fs/promises'
import path from 'path'
import { app } from 'electron'
import { logger } from './log'

interface LogQueryParams {
  type?: string // 日志类型/级别 (info, warn, error等)
  startDateTime?: Date // 开始时间
  endDateTime?: Date // 结束时间
  page?: number // 页码 (从1开始)
  size?: number // 每页条数
  sort?: 'asc' | 'desc' // 排序方式 (asc: 日期正序, desc: 日期倒序)
}

interface LogEntry {
  timestamp: Date // 日志时间戳
  level: string // 日志级别
  scope?: string // 日志范围/模块
  message: string // 日志内容
  raw: string // 原始日志行
}

/**
 * 获取日志目录路径
 */
function getLogDir(): string {
  return app.getPath('logs')
}

/**
 * 获取所有日志文件列表（支持按日期排序）
 */
async function getLogFiles(sort: 'asc' | 'desc' = 'desc'): Promise<string[]> {
  try {
    const logDir = getLogDir()
    const files = await fs.readdir(logDir)
    const logFiles = files.filter((file) => file.endsWith('.log'))

    return sort === 'desc'
      ? logFiles.sort((a, b) => b.localeCompare(a)) // 日期倒序
      : logFiles.sort((a, b) => a.localeCompare(b)) // 日期正序
  } catch (error) {
    logger.error(`获取日志文件列表失败: ${error.message}`)
    return []
  }
}

/**
 * 解析单条日志行
 */
function parseLogLine(line: string): LogEntry | null {
  if (!line.trim()) return null

  // 示例日志格式: [2023-01-01 12:00:00.123] [info]{scope} message
  const regex = /^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3})] \[(\w+)](?:\{([^}]+)})? (.*)$/
  const match = line.match(regex)

  if (!match) {
    logger.warn(`无法解析的日志行: ${line}`)
    return null
  }

  const [, timestampStr, level, scope, message] = match

  return {
    timestamp: new Date(timestampStr),
    level,
    scope,
    message,
    raw: line
  }
}

/**
 * 检查日志条目是否在时间范围内
 */
function isInTimeRange(entry: LogEntry, start?: Date, end?: Date): boolean {
  if (start && entry.timestamp < start) return false
  return !(end && entry.timestamp > end)
}

/**
 * 读取并过滤日志
 */
async function readLogs(params: LogQueryParams = {}): Promise<{
  logs: LogEntry[]
  total: number
  page: number
  size: number
}> {
  const { type, startDateTime, endDateTime, page = 1, size = 20, sort = 'desc' } = params

  // 获取日志文件列表（按日期排序）
  const logFiles = await getLogFiles(sort)

  const allLogs: LogEntry[] = []

  // 读取所有符合条件的日志文件
  for (const file of logFiles) {
    const filePath = path.join(getLogDir(), file)

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const lines = content.split('\n')

      for (const line of lines) {
        const entry = parseLogLine(line)
        if (!entry) continue

        // 应用过滤条件
        if (type && entry.level !== type) continue
        if (!isInTimeRange(entry, startDateTime, endDateTime)) continue

        allLogs.push(entry)
      }
    } catch (error) {
      logger.error(`读取日志文件失败: ${filePath} - ${error.message}`)
    }
  }

  // 应用排序
  if (sort === 'desc') {
    allLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  } else {
    allLogs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  // 分页处理
  const startIndex = (page - 1) * size
  const paginatedLogs = allLogs.slice(startIndex, startIndex + size)

  return {
    logs: paginatedLogs,
    total: allLogs.length,
    page,
    size
  }
}

/**
 * 获取可用的日志类型
 */
async function getLogLevels(): Promise<string[]> {
  const logFiles = await getLogFiles()
  const levels = new Set<string>()

  for (const file of logFiles.slice(0, 3)) {
    // 只检查前3个文件避免性能问题
    const filePath = path.join(getLogDir(), file)

    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const lines = content.split('\n')

      for (const line of lines.slice(0, 100)) {
        // 只检查前100行
        const entry = parseLogLine(line)
        if (entry) {
          levels.add(entry.level)
        }
      }
    } catch (error) {
      logger.error(`读取日志文件失败: ${filePath} - ${error.message}`)
    }
  }

  return Array.from(levels).sort()
}

export { readLogs, getLogFiles, getLogLevels, type LogQueryParams, type LogEntry }
