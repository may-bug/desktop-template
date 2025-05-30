import { onBeforeUnmount, ref } from 'vue'
import { getPlatform } from '../utils/permission'
import { getDesktopSources } from '../utils/screen'

interface UseWebRTCShareOptions {
  signalingUrl: string
  token: string
  uid: string
  deviceId: string
  to: string
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useWebRTCShare(options: UseWebRTCShareOptions) {
  const peer = new RTCPeerConnection({
    iceServers: [
      { urls: 'stun:turn.tecgui.cn:3478' },
      {
        urls: 'turn:turn.tecgui.cn:3478',
        username: 'tecgui',
        credential: 'tecgui'
      }
    ]
  })

  const ws = ref<WebSocket | null>(null)
  const localStream = ref<MediaStream | null>(null)
  const disconnected = ref(false)
  const from = ref('')

  let heartbeatInterval: ReturnType<typeof setInterval> | null = null

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const sendSignal = (data: unknown) => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data))
    }
  }

  const initSignaling = (): Promise<void> => {
    return new Promise((resolve) => {
      const url = `${options.signalingUrl}?token=${options.token}&uid=${options.uid}&deviceId=${options.deviceId}`
      ws.value = new WebSocket(url)

      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      ws.value.onopen = () => {
        disconnected.value = false
        startHeartbeat()
        resolve()
      }

      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      ws.value.onmessage = async (event) => {
        const msg = JSON.parse(event.data)

        if (msg.type === 'offer') {
          await peer.setRemoteDescription(new RTCSessionDescription(msg.offer))
          const answer = await peer.createAnswer()
          await peer.setLocalDescription(answer)
          from.value = msg.from

          sendSignal({
            type: 'answer',
            from: options.deviceId,
            to: msg.from,
            answer
          })
        } else if (msg.type === 'candidate') {
          await peer.addIceCandidate(new RTCIceCandidate(msg.candidate))
        } else if (msg.type === 'pong') {
          // 保持心跳
        }
      }

      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      ws.value.onerror = () => {
        console.warn('WebSocket error')
      }

      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      ws.value.onclose = () => {
        console.warn('WebSocket closed')
        disconnected.value = true
        stopHeartbeat()
        peer.close()
        ws.value = null
      }

      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      peer.onicecandidate = (e) => {
        if (e.candidate) {
          sendSignal({
            type: 'candidate',
            to: from.value,
            from: options.deviceId,
            candidate: e.candidate
          })
        }
      }

      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      peer.ondatachannel = (event) => {
        const dataChannel = event.channel
        console.log('接收到 DataChannel:', dataChannel.label)

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        dataChannel.onopen = () => {
          console.log('DataChannel 已连接')
        }

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        dataChannel.onmessage = (e) => {
          console.log('收到 DataChannel 消息:', e.data)
          try {
            const payload = JSON.parse(e.data)

            // 校验基本结构
            if (payload && payload.type === 'input') {
              // 通过 IPC 将事件传递给主进程
              window.electron.ipcRenderer.send('remote-control-event', payload.payload)
            } else {
              console.warn('收到未知格式的控制消息:', payload)
            }
          } catch (err) {
            console.error('控制命令解析失败:', err)
          }
        }

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        dataChannel.onerror = (error) => {
          console.error('DataChannel 错误:', error)
        }

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        dataChannel.onclose = () => {
          console.log('DataChannel 已关闭')
        }
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const startSharing = async () => {
    const isLinux = (await getPlatform()) === 'Linux'
    if (isLinux) {
      const sources = await getDesktopSources({ types: ['screen'] })
      const selectedSource = sources[0]
      localStream.value = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: selectedSource.id,
            // minWidth: 1280,
            minWidth: 1960,
            maxWidth: 3840,
            // minHeight: 720,
            minHeight: 1080,
            maxHeight: 2160
          }
        }
      })
    }
    else {
      localStream.value = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })
    }
    localStream.value.getTracks().forEach((track) => {
      console.log('添加轨道:', track.kind)
      peer.addTrack(track, localStream.value)
    })
    await initSignaling()
    console.log('Senders:', peer.getSenders())
    return localStream.value
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const stopSharing = () => {
    localStream.value?.getTracks().forEach((track) => track.stop())
    peer.close()
    ws.value?.close()
    stopHeartbeat()
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const startHeartbeat = () => {
    stopHeartbeat()
    heartbeatInterval = setInterval(() => {
      if (ws.value?.readyState === WebSocket.OPEN) {
        ws.value.send(JSON.stringify({ type: 'ping' }))
      }
    }, 20000)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const stopHeartbeat = () => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
    }
  }

  onBeforeUnmount(() => {
    stopSharing()
  })

  return {
    localStream,
    disconnected,
    startSharing,
    stopSharing
  }
}
