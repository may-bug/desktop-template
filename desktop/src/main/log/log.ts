// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import log from 'electron-log'
import { app } from 'electron'

// 关闭控制台打印
log.transports.console.level = true
log.transports.file.level = 'debug'
log.transports.file.maxSize = 10024300 // 文件最大不超过 10M
// 输出格式
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'
const date = new Date()
const dateStr = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
// 文件位置及命名方式
// 默认位置为：C:\Users\[user]\AppData\Roaming\[appname]\electron_log\
// 文件名为：年-月-日.log
// 自定义文件保存位置为安装目录下 \log\年-月-日.log
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
log.transports.file.resolvePath = () => app.getPath('logs') + '/' + dateStr + '.log'

const logger={
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  info(param) {
    log.info(param)
  },
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  warn(param) {
    log.warn(param)
  },
  error(param) {
    log.error(param)
  },
  debug(param) {
    log.debug(param)
  },
  verbose(param) {
    log.verbose(param)
  },
  silly(param) {
    log.silly(param)
  }
}

export { logger }
