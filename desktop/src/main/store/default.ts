import Store from 'electron-store'
import { app } from 'electron'
import { logger } from '../log'
import { generateNineDigitNumber } from '../utils'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initialState = (store, key, value) => {
  if (store.get(key) == undefined) {
    store.set(key, value)
    logger.info({ score: 'store', value: ` store value init [key] ${key} [value] ${value}` })
  }
}
/**
 * 本地存储设置
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createStore = () => {
  const option = {
    name: 'config',
    fileExtension: 'json',
    cwd: app.getPath('userData'), //文件位置,尽量不要动，默认情况下，它将通过遵循系统约定来选择最佳位置。
    encryptionKey: 'aes-256-cbc', //对配置文件进行加密
    clearInvalidConfig: false // 发生 SyntaxError  则清空配置
  }
  const store = new Store(option)
  initialState(store, 'welcome', false)
  initialState(store, 'remember_closed', false)
  initialState(store, 'closed_value', false)
  initialState(store, 'deviceId', generateNineDigitNumber())
  return store
}

export { createStore }
