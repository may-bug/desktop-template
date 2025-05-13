interface LogQueryParams {
  type?: string
  startDateTime?: Date
  endDateTime?: Date
  page?: number
  size?: number
  sort?: 'asc' | 'desc'
  keyword?: string
}

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

/**
 * 通过 IPC 调用主进程日志服务
 */
async function invokeLogService<T>(channel: string, ...args: never[]): Promise<T> {
  return window.electron.ipcRenderer.invoke(channel, ...args) as Promise<T>
}

/**
 * 读取日志数据
 */
export async function readLogs(params: LogQueryParams = {}): Promise<LogResponse> {
  // 转换 Date 对象为字符串以便 IPC 传输
  const serializedParams = {
    ...params,
    startDateTime: params.startDateTime?.toISOString(),
    endDateTime: params.endDateTime?.toISOString()
  }

  return invokeLogService<LogResponse>('logs-read', serializedParams)
}

/**
 * 获取可用的日志级别
 */
export async function getLogLevels(): Promise<string[]> {
  return invokeLogService<string[]>('logs-levels')
}

/**
 * 获取所有日志文件列表
 */
export async function getLogFiles(sort: 'asc' | 'desc' = 'desc'): Promise<string[]> {
  return invokeLogService<string[]>('logs-files', sort)
}

/**
 * 导出日志文件
 */
export async function exportLogs(params: LogQueryParams = {}): Promise<string> {
  const serializedParams = {
    ...params,
    startDateTime: params.startDateTime?.toISOString(),
    endDateTime: params.endDateTime?.toISOString()
  }

  return invokeLogService<string>('logs-export', serializedParams)
}

export type { LogQueryParams, LogEntry }
