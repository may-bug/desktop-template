/**
 * 设置配置值
 * @param key
 * @param value
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const setValue = (key: string, value: never) => {
  return window.electron.ipcRenderer.invoke('set-config', key, value)
}

/**
 * 获取配置值
 * @param key
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getValue = (key: string) => {
  return window.electron.ipcRenderer.invoke('get-config', key)
}

export { setValue, getValue }
