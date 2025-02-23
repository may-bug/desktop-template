import { ipcMain } from 'electron'
import { createStore } from './default'
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
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  })

  /**
   * 查询配置
   */
  ipcMain.handle('get-config', async (_event, key: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      return store.get(key)
    } catch (e) {
      console.error(e)
      return e
    }
  })
}

export { initStore, store }
