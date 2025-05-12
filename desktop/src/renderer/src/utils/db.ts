// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import { deleteParam, insertParam, queryParam, updateParam } from '../../../main/sqlite/types'

/**
 * 插入数据
 * Promise
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const insertData = (param: insertParam) => {
  return window.electron.ipcRenderer.invoke('db-insert', param)
}

/**
 * 更新数据
 * Promise
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const updateData = (param: updateParam) => {
  return window.electron.ipcRenderer.invoke('db-update', param)
}

/**
 * sql执行
 * Promise
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const queryData = (param: queryParam) => {
  return window.electron.ipcRenderer.invoke('db-query', param)
}

/**
 * 删除数据
 * Promise
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const deleteData = (param: deleteParam) => {
  return window.electron.ipcRenderer.invoke('db-delete', param)
}

export { insertData, queryData, updateData, deleteData }
