import { desktopCapturer, ipcMain } from 'electron'
// const ffmpeg = require('fluent-ffmpeg')
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initScreen = () => {
  /**
   *  处理获取桌面源的请求
   */
  ipcMain.handle('get-desktop-sources', async () => {
    return await desktopCapturer.getSources({
      types: ['screen', 'window']
    })
  })
  // // 处理开始录制请求
  // ipcMain.handle('start-recording', async (event, { outputPath, screenId }) => {
  //   return new Promise((resolve, reject) => {
  //       ffmpeg()
  //       .input(getScreenInput(screenId)) // 根据平台获取输入源
  //       .videoCodec('libx264')
  //       .audioCodec('aac')
  //       .outputOptions('-preset ultrafast')
  //       .save(outputPath)
  //       .on('start', (commandLine) => {
  //         console.log('FFmpeg command:', commandLine)
  //         resolve('started')
  //       })
  //       .on('error', (err) => {
  //         console.error('录制失败:', err)
  //         reject(err)
  //       })
  //   })
  // })
  //
  // // 处理停止录制
  // ipcMain.handle('stop-recording', async () => {
  //   if (recorder) {
  //     recorder.kill('SIGINT') // 发送终止信号
  //     recorder = null
  //     return 'stopped'
  //   }
  // })
  //
  // // 获取平台相关输入源配置
  // // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  // function getScreenInput(screenId) {
  //   if (process.platform === 'darwin') {
  //     return `avfoundation?::${screenId}` // macOS 使用 avfoundation
  //   } else if (process.platform === 'win32') {
  //     return `desktop` // Windows 使用 gdigrab
  //   } else {
  //     throw new Error('Unsupported platform')
  //   }
  // }
}

export { initScreen }
