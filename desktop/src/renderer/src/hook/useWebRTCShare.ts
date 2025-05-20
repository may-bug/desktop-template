import { ref, onBeforeUnmount } from 'vue'

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
          // 控制端发来 offer，设置远端描述
          await peer.setRemoteDescription(new RTCSessionDescription(msg.offer))

          // 3. 创建备用 DataChannel
          const dataChannel = peer.createDataChannel('control-channel')

          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          dataChannel.onopen = () => {
            console.log('DataChannel opened')
          }
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          dataChannel.onmessage = (event) => {
            console.log('Received message on data channel:', event.data)
          }
          // 创建本地 answer 并发送回控制端
          const answer = await peer.createAnswer()
          await peer.setLocalDescription(answer)

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
          console.log('Sending ICE candidate:', e.candidate)
          sendSignal({
            type: 'candidate',
            to: options.to, // 可根据需要指定对端 deviceId
            from: options.deviceId,
            candidate: e.candidate
          })
        }
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const startSharing = async () => {
    await initSignaling()
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      localStream.value = stream
      stream.getTracks().forEach((track) => peer.addTrack(track, stream))
    })
    return localStream
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
