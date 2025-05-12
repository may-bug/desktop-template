import { ipcMain } from 'electron'
import { createStore } from './default'
import { logger } from '../log'
let store = null

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initStore = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  store = createStore()
  // 创建配置
  ipcMain.handle('set-config', async (_event, key: string, value) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      store.set(key, value)
      logger.info({ score: 'store', value: ` store value set [key] ${key} [value] ${value}` })
      return true
    } catch (e) {
      logger.error({
        score: 'store',
        value: ` store value set [key] ${key} [value] ${value} error ${e.message}`
      })
      return false
    }
  })

  /**
   * 查询配置
   */
  ipcMain.handle('get-config', async (_event, key: string) => {
    try {
      const value = await store.get(key)
      logger.info({ score: 'store', value: ` store value get [key] ${key} [value] ${value}` })
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      return value
    } catch (e) {
      logger.error({
        score: 'store',
        value: ` store value get [key] ${key} error ${e.message}`
      })
      return e
    }
  })
}

export { initStore, store }
