import fs from 'fs/promises'
import { app } from 'electron'
import { logger } from './log'

// 类型定义
interface LogEntry {
  timestamp: Date
  level: string
  scope?: string
  message: string
  raw: string
}

interface LogResponse {
  logs: LogEntry[]
  total: number
  page: number
  size: number
}

interface LogQueryParams {
  type?: string
  startDateTime?: Date
  endDateTime?: Date
  page?: number
  size?: number
  sort?: 'asc' | 'desc'
  keyword?: string
}

// 工具函数
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getLogDir = () => app.getPath('logs')

const parseLogLine = (line: string): LogEntry | null => {
  if (!line.trim()) return null

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

const isInTimeRange = (entry: LogEntry, start?: Date, end?: Date): boolean => {
  if (start && entry.timestamp < start) return false
  return !(end && entry.timestamp > end)
}

// 核心日志函数
const getLogFiles = async (sort: 'asc' | 'desc' = 'desc'): Promise<string[]> => {
  try {
    const logDir = getLogDir()
    const files = await fs.readdir(logDir)
    const logFiles = files.filter((file) => file.endsWith('.log'))

    return sort === 'desc'
      ? logFiles.sort((a, b) => b.localeCompare(a))
      : logFiles.sort((a, b) => a.localeCompare(b))
  } catch (error) {
    logger.error(`获取日志文件列表失败: ${error.message}`)
    return []
  }
}

const readLogFile = async (filePath: string): Promise<LogEntry[]> => {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return content
      .split('\n')
      .map(parseLogLine)
      .filter((entry): entry is LogEntry => entry !== null)
  } catch (error) {
    logger.error(`读取日志文件失败: ${filePath} - ${error.message}`)
    return []
  }
}

const filterLogs = (entries: LogEntry[], params: LogQueryParams): LogEntry[] => {
  return entries.filter((entry) => {
    if (params.type && entry.level !== params.type) return false
    if (!isInTimeRange(entry, params.startDateTime, params.endDateTime)) return false
    if (params.keyword && !entry.message.includes(params.keyword)) return false
    return true
  })
}

const sortLogs = (entries: LogEntry[], sort: 'asc' | 'desc' = 'desc'): LogEntry[] => {
  return [...entries].sort((a, b) =>
    sort === 'desc'
      ? b.timestamp.getTime() - a.timestamp.getTime()
      : a.timestamp.getTime() - b.timestamp.getTime()
  )
}

const paginateLogs = (
  entries: LogEntry[],
  page: number = 1,
  size: number = 20
): { logs: LogEntry[]; total: number } => {
  const startIndex = (page - 1) * size
  return {
    logs: entries.slice(startIndex, startIndex + size),
    total: entries.length
  }
}

export {
  LogResponse,
  LogEntry,
  LogQueryParams,
  getLogDir,
  parseLogLine,
  paginateLogs,
  sortLogs,
  filterLogs,
  readLogFile,
  getLogFiles
}
