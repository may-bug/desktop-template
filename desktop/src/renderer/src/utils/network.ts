/**
 * 通过主进程发起http请求
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const netRequest= async (options) => {
  try {
    const result = await window.electron.ipcRenderer.invoke('http', options)
    console.log('收到响应:', result)
  } catch (error) {
    console.error('请求失败:', error)
  }
}

/**
 * 获取网络信息
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getNetInfo = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('get-network-info')
    console.log('收到响应:', result)
  } catch (error) {
    console.error('请求失败:', error)
  }
}
export { netRequest, getNetInfo }
