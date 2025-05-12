const readLogs = () => {}

const getLogLevels = () => {}

interface LogEntry {}

interface LogQueryParams {}

/**
 * 日志打印
 * @param type
 * @param value
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const logger = (type: 'info' | 'warn' | 'error', value) => {
  window.electron.ipcRenderer.send('log', type, `[renderer] ${value}`)
}

export { logger, LogEntry, LogQueryParams, getLogLevels, readLogs }
