/**
 * 日志打印
 * @param type 类型
 * @param model 模块
 * @param value 记录值
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const log = (type: 'info' | 'warn' | 'error', model: string, value: never) => {
  const data = {
    type: type,
    value: value,
    model: model
  }
  window.electron.ipcRenderer.send('log', data)
}
class Logger {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/no-empty-function
  info() {}
}

const logger=new Logger()

export { logger, log }
