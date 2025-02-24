import { dialog, BrowserWindow } from 'electron'
import * as fs from 'fs'

interface Options {
  title?: string
}

/**
 * 创建选择文件弹窗
 * @param option
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createFileDialog = (option: Options) => {
  const win = BrowserWindow.getFocusedWindow()
  return win
    ? dialog.showOpenDialog(win, {
        title: option.title,
        properties: ['openFile', 'multiSelections']
      })
    : Promise.reject(new Error('No active window'))
}

/**
 * 保存文件
 * @param content 要保存的内容
 * @param filePath 文件路径
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const saveFile = (content: string, filePath: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(filePath, content, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

/**
 * 读取文件
 * @param filePath 文件路径
 */
const readFile = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

/**
 * 删除文件
 * @param filePath 文件路径
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const deleteFile = (filePath: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}

export { createFileDialog, readFile, deleteFile, saveFile }
