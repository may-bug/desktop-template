import { dialog } from 'electron'

interface Options {
  title: string | undefined
}

/**
 * 创建选择文件弹窗
 * @param option
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const createFileDialog = (option: Options) => {
  return dialog.showOpenDialog({ title: option.title, properties: ['openFile', 'multiSelections'] })
}

export { createFileDialog }
