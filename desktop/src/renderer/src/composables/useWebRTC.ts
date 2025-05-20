import { ref, onUnmounted, watch } from 'vue'
import { useSignalingStore } from '../stores/signaling'

// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/explicit-function-return-type
export function useWebRTC(userId: string) {
  const signaling = useSignalingStore()
  const localStream = ref<MediaStream | null>(null)
  const remoteStreams = ref<Map<string, MediaStream>>(new Map())
  const peerConnections = ref<Map<string, RTCPeerConnection>>(new Map())

  // 初始化本地媒体流
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const initLocalStream = async () => {
    try {
      localStream.value = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      })
    } catch (err) {
      console.error('Error accessing media devices:', err)
      throw err
    }
  }

  // 创建对等连接
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const createPeerConnection = (peerId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'turn:turn.tecgui.cn:3478',
          username: 'root',
          credential: 'Lin021219'
        }
      ]
    })

    // 添加本地流到连接
    if (localStream.value) {
      localStream.value.getTracks().forEach((track) => {
        pc.addTrack(track, localStream.value!)
      })
    }

    // ICE候选处理
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signaling.sendIceCandidate(peerId, event.candidate)
      }
    }

    // 远程流处理
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    pc.ontrack = (event) => {
      const remoteStream = new MediaStream()
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track)
      })
      remoteStreams.value.set(peerId, remoteStream)
    }

    peerConnections.value.set(peerId, pc)
    return pc
  }

  // 处理收到的offer
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleOffer = async (from: string, sdp: RTCSessionDescriptionInit) => {
    const pc = createPeerConnection(from)

    await pc.setRemoteDescription(new RTCSessionDescription(sdp))
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    signaling.sendAnswer(from, answer)
  }

  // 处理收到的answer
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleAnswer = async (from: string, sdp: RTCSessionDescriptionInit) => {
    const pc = peerConnections.value.get(from)
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp))
    }
  }

  // 处理收到的ICE候选
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleIceCandidate = async (from: string, candidate: RTCIceCandidateInit) => {
    const pc = peerConnections.value.get(from)
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      } catch (err) {
        console.error('Error adding ICE candidate:', err)
      }
    }
  }

  // 连接到新peer
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const connectToPeer = async (peerId: string) => {
    const pc = createPeerConnection(peerId)

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    signaling.sendOffer(peerId, offer)
  }

  // 初始化消息监听
  signaling.initMessageHandler()

  // 监听信令消息
  watch(
    () => signaling.messages.value,
    (newMessages) => {
      const lastMessage = newMessages[newMessages.length - 1]
      if (!lastMessage) return

      switch (lastMessage.type) {
        case 'offer':
          handleOffer(lastMessage.from, lastMessage.sdp)
          break
        case 'answer':
          handleAnswer(lastMessage.from, lastMessage.sdp)
          break
        case 'ice-candidate':
          handleIceCandidate(lastMessage.from, lastMessage.candidate)
          break
      }
    }
  )

  // 清理
  onUnmounted(() => {
    peerConnections.value.forEach((pc) => pc.close())
    if (localStream.value) {
      localStream.value.getTracks().forEach((track) => track.stop())
    }
    signaling.disconnect()
  })

  return {
    localStream,
    remoteStreams,
    initLocalStream,
    connectToPeer
  }
}
