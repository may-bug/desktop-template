import { desktopCapturer } from 'electron'

class VideoCaptureService {
  private streams: Map<string, MediaStream> = new Map()
  private mediaRecorders: Map<string, MediaRecorder> = new Map()
  private recordedChunks: Map<string, Blob[]> = new Map()

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async startRecording(sourceId: string) {
    const stream = this.streams.get(sourceId)
    if (!stream) throw new Error('Stream not found')

    const options = { mimeType: 'video/webm; codecs=vp9' }
    const recorder = new MediaRecorder(stream, options)
    this.mediaRecorders.set(sourceId, recorder)
    this.recordedChunks.set(sourceId, [])

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.get(sourceId)?.push(event.data)
      }
    }

    recorder.start(1000) // 每1秒收集一次数据
  }

  async stopRecording(sourceId: string): Promise<Blob> {
    const recorder = this.mediaRecorders.get(sourceId)
    if (!recorder) throw new Error('Recorder not found')

    recorder.stop()
    this.mediaRecorders.delete(sourceId)

    return new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      recorder.onstop = () => {
        const chunks = this.recordedChunks.get(sourceId) || []
        const blob = new Blob(chunks, { type: 'video/webm' })
        this.recordedChunks.delete(sourceId)
        resolve(blob)
      }
    })
  }
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async getVideoSources() {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: screen.getPrimaryDisplay().workAreaSize
    })
    return sources.map((source) => ({
      id: source.id,
      name: source.name,
      thumbnail: source.thumbnail.toDataURL()
    }))
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async startCapture(
    sourceId: string,
    options = {
      width: 1280,
      height: 720,
      frameRate: 15,
      audio: true
    }
  ) {
    const constraints = {
      audio: options.audio,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
          minWidth: options.width,
          maxWidth: options.width,
          minHeight: options.height,
          maxHeight: options.height,
          minFrameRate: options.frameRate,
          maxFrameRate: options.frameRate
        }
      }
    }

    // // @ts-ignore - navigator.mediaDevices 在 Electron 主进程中需要这样访问
    // const stream = await navigator.mediaDevices.getUserMedia(constraints)
    // this.streams.set(sourceId, stream)
    const stream = new MediaStream(constraints)
    const videoTrack = new MediaStreamTrack({ kind: 'video' })
    stream.addTrack(videoTrack)
    return stream
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  stopCapture(sourceId: string) {
    const stream = this.streams.get(sourceId)
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      this.streams.delete(sourceId)
    }
  }
}

const videoCaptureService = new VideoCaptureService()

export { VideoCaptureService, videoCaptureService }
