import { ipcMain } from 'electron'
import { deleteParam, insertParam, queryParam, updateParam } from './types'
import { createSqlite, sqlDelete, sqlInsert, sqlQuery, sqlUpdate } from './db'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initSqlite = async () => {
  await createSqlite()
  //sqlite插入
  ipcMain.handle('db-insert', async (_event, param: insertParam) => {
    return await sqlInsert(param)
  })

  //sqlite更新
  ipcMain.handle('db-update', async (_event, param: updateParam) => {
    return await sqlUpdate(param)
  })

  //sqlite删除
  ipcMain.handle('db-delete', async (_event, param: deleteParam) => {
    return await sqlDelete(param)
  })

  //sqlite语句
  ipcMain.handle('db-query', async (_event, param: queryParam) => {
    return await sqlQuery(param)
  })
}

export { initSqlite }
