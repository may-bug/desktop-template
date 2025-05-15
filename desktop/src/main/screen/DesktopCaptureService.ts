import fs from 'fs'
import { desktopCapturer } from 'electron'

class DesktopCaptureService {
  private static instance: DesktopCaptureService

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): DesktopCaptureService {
    if (!DesktopCaptureService.instance) {
      DesktopCaptureService.instance = new DesktopCaptureService()
    }
    return DesktopCaptureService.instance
  }

  // 获取所有捕获源
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public async getSources(types: Array<'screen' | 'window'> = ['screen', 'window']) {
    return await desktopCapturer.getSources({
      types,
      thumbnailSize: screen.getPrimaryDisplay().workAreaSize
    })
  }

  // 捕获指定源
  public async captureSource(
    sourceId: string,
    options = {
      width: 1280,
      height: 720
    }
  ): Promise<Electron.NativeImage> {
    const sources = await this.getSources()
    const source = sources.find((s) => s.id === sourceId)

    if (!source) {
      throw new Error('Source not found')
    }

    return source.thumbnail.resize(options)
  }

  // 保存捕获的图像
  public async saveCapture(image: Electron.NativeImage, filePath: string): Promise<void> {
    const data = image.toPNG()
    fs.writeFileSync(filePath, data)
  }
}

/**
 * 初始化捕获服务
 */
const captureService = DesktopCaptureService.getInstance()
export { captureService }
