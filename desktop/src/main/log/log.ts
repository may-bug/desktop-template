import log from 'electron-log'
import { app } from 'electron'
import path from 'path'

interface LogParams {
  model: 'main' | 'renderer'
  score: string
  value: string
}
// 关闭控制台打印
log.transports.console.level = true
log.transports.file.level = 'debug'
log.transports.file.maxSize = 10024300 // 文件最大不超过 10M
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}' // 输出格式
const dateStr = new Date().toISOString().split('T')[0]

// 修改为 resolvePathFn，并添加正确的返回类型
log.transports.file.resolvePathFn = (): string => {
  return path.join(app.getPath('logs'), `${dateStr}.log`)
}

const logger = {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  info(param: LogParams) {
    log.info(
      `[${param.model === undefined ? 'main' : param.model}] [${param.score}] ${param.value}`
    )
  },
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  warn(param: LogParams) {
    log.warn(
      `[${param.model === undefined ? 'main' : param.model}] [${param.score}] ${param.value}`
    )
  },
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  error(param: LogParams) {
    log.error(
      `[${param.model === undefined ? 'main' : param.model}] [${param.score}] ${param.value}`
    )
  },
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  debug(param: LogParams) {
    log.debug(
      `[${param.model === undefined ? 'main' : param.model}] [${param.score}] ${param.value}`
    )
  },
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  verbose(param: LogParams) {
    log.verbose(
      `[${param.model === undefined ? 'main' : param.model}] [${param.score}] ${param.value}`
    )
  },
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  silly(param: LogParams) {
    log.silly(
      `[${param.model === undefined ? 'main' : param.model}] [${param.score}] ${param.value}`
    )
  }
}

export { logger }
