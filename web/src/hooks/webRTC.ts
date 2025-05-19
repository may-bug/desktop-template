import { ref, onMounted, onBeforeUnmount } from 'vue'

export interface SignalMessage {
    type: string
    data: any
}

interface UseRemoteDesktopOptions {
    isHost: boolean // true 桌面端(屏幕采集端)，false 控制端
    sendSignal: (msg: SignalMessage) => void // 发送信令的函数，必须传入
    onSignal: (callback: (msg: SignalMessage) => void) => void // 监听信令的函数，必须传入
}

export function useRemoteDesktop({ isHost, sendSignal, onSignal }: UseRemoteDesktopOptions) {
    const localStream = ref<MediaStream | null>(null)
    const remoteStream = ref<MediaStream | null>(null)
    const connected = ref(false)
    const pc = ref<RTCPeerConnection | null>(null)

    // ICE servers 推荐添加自己的 TURN 服务，下面只是示例 stun
    const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }]

    // 创建 PeerConnection
    const createPeerConnection = () => {
        const connection = new RTCPeerConnection({ iceServers })

        connection.onicecandidate = (event) => {
            if (event.candidate) {
                sendSignal({ type: 'ice-candidate', data: event.candidate })
            }
        }

        connection.onconnectionstatechange = () => {
            if (connection.connectionState === 'connected') {
                connected.value = true
            } else if (
                connection.connectionState === 'disconnected' ||
                connection.connectionState === 'failed' ||
                connection.connectionState === 'closed'
            ) {
                connected.value = false
            }
        }

        if (!isHost) {
            // 控制端接收远程流
            const remote = new MediaStream()
            remoteStream.value = remote
            connection.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    remote.addTrack(track)
                })
            }
        }

        return connection
    }

    // 处理信令消息
    const handleSignal = async (msg: SignalMessage) => {
        if (!pc.value) return
        const connection = pc.value

        switch (msg.type) {
            case 'offer':
                if (!isHost) {
                    await connection.setRemoteDescription(new RTCSessionDescription(msg.data))
                    const answer = await connection.createAnswer()
                    await connection.setLocalDescription(answer)
                    sendSignal({ type: 'answer', data: answer })
                }
                break
            case 'answer':
                if (isHost) {
                    await connection.setRemoteDescription(new RTCSessionDescription(msg.data))
                }
                break
            case 'ice-candidate':
                if (msg.data) {
                    try {
                        await connection.addIceCandidate(new RTCIceCandidate(msg.data))
                    } catch (e) {
                        console.warn('添加 ICE Candidate 失败', e)
                    }
                }
                break
        }
    }

    const startConnection = async () => {
        pc.value = createPeerConnection()

        onSignal(handleSignal)

        if (isHost) {
            // 桌面端采集屏幕流
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
                localStream.value = stream
                stream.getTracks().forEach((track) => pc.value!.addTrack(track, stream))

                const offer = await pc.value.createOffer()
                await pc.value.setLocalDescription(offer)
                sendSignal({ type: 'offer', data: offer })
            } catch (e) {
                console.error('获取屏幕流失败:', e)
            }
        }
    }

    const closeConnection = () => {
        localStream.value?.getTracks().forEach((t) => t.stop())
        remoteStream.value?.getTracks().forEach((t) => t.stop())
        pc.value?.close()
        pc.value = null
        localStream.value = null
        remoteStream.value = null
        connected.value = false
    }

    onMounted(() => {
        startConnection()
    })

    onBeforeUnmount(() => {
        closeConnection()
    })

    return {
        localStream,
        remoteStream,
        connected,
        closeConnection
    }
}
