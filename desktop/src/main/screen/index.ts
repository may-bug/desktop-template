import { desktopCapturer, ipcMain} from 'electron'
import { videoCaptureService } from './desktopCapture'
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const initScreen = () => {
  /**
   *  处理获取桌面源的请求
   */
  ipcMain.handle('get-desktop-sources', async () => {
    return await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 1024, height: 768 }
    })
  })
  ipcMain.handle('get-video-sources', () => videoCaptureService.getVideoSources())
  ipcMain.handle('start-video-capture', (_, sourceId: string) =>
    videoCaptureService.startCapture(sourceId)
  )
  ipcMain.handle('stop-video-capture', (_, sourceId: string) =>
    videoCaptureService.stopCapture(sourceId)
  )
}

export { initScreen }
