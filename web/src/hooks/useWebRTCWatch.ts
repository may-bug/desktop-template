import { ref, onBeforeUnmount } from 'vue'

interface UseWebRTCWatchOptions {
    signalingUrl: string
    token: string
    uid: string        // 当前用户 uid
    deviceId: string   // 当前设备 id（watcher）
    to: string         // 目标主播设备 id
}

export function useWebRTCWatch(options: UseWebRTCWatchOptions) {
    const remoteStream = ref<MediaStream | null>(null)
    const disconnected = ref(false)
    let dataChannel:any
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
    const maxReconnectAttempts = 5
    let reconnectAttempts = 0
    let heartbeatInterval: ReturnType<typeof setInterval> | null = null

    const sendSignal = (data: unknown) => {
        if (ws.value?.readyState === WebSocket.OPEN) {
            ws.value.send(JSON.stringify(data))
        }
    }

    // 观看端主动发起 offer
    const createAndSendOffer = async () => {
        peer.addTransceiver('video', { direction: 'recvonly' })
        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer)

        sendSignal({
            type: 'offer',
            from: options.deviceId,
            to: options.to,
            offer
        })
    }

    const initSignaling = (): Promise<void> => {
        return new Promise((resolve) => {
            const url = `${options.signalingUrl}?token=${options.token}&uid=${options.uid}&deviceId=${options.deviceId}`
            ws.value = new WebSocket(url)

            ws.value.onopen = async () => {
                disconnected.value = false
                reconnectAttempts = 0
                startHeartbeat()

                // 观看端连接后主动发起 offer
                await createAndSendOffer()

                resolve()
            }

            ws.value.onmessage = async (event) => {
                const msg = JSON.parse(event.data)

                if (msg.type === 'answer') {
                    // 收到主播端 answer，设置远端描述
                    await peer.setRemoteDescription(new RTCSessionDescription(msg.answer))
                } else if (msg.type === 'candidate') {
                    // 收到 ICE candidate
                    await peer.addIceCandidate(new RTCIceCandidate(msg.candidate))
                } else if (msg.type === 'pong') {
                    // 心跳响应
                }
            }

            ws.value.onerror = () => {
                console.warn('WebSocket error')
            }

            ws.value.onclose = () => {
                console.warn('WebSocket closed')
                stopHeartbeat()
                disconnected.value = true

                if (reconnectAttempts < maxReconnectAttempts) {
                    setTimeout(() => {
                        reconnectAttempts++
                        initSignaling().then(() => {
                            console.info('WebSocket reconnected')
                        })
                    }, 2000)
                }
            }

            peer.onicecandidate = (e) => {
                if (e.candidate) {
                    sendSignal({
                        type: 'candidate',
                        from: options.deviceId,
                        to: options.to,
                        candidate: e.candidate
                    })
                }
            }

            peer.ontrack = (e) => {
                console.log("视频通道",e.track)
                if (!remoteStream.value) {
                    remoteStream.value = new MediaStream()
                }
                remoteStream.value.addTrack(e.track)
            }

            dataChannel = peer.createDataChannel('control-channel')

            peer.ondatachannel = (event) => {
                const dataChannel = event.channel
                console.log('DataChannel received:', dataChannel.label)

                dataChannel.onopen = () => {
                    console.log('DataChannel opened')
                }

                dataChannel.onmessage = (e) => {
                    console.log('Received message from DataChannel:', e.data)
                }

                dataChannel.onclose = () => {
                    console.log('DataChannel closed')
                }

                dataChannel.onerror = (error) => {
                    console.error('DataChannel error:', error)
                }
            }
        })
    }

    const startHeartbeat = () => {
        stopHeartbeat()
        heartbeatInterval = setInterval(() => {
            if (ws.value?.readyState === WebSocket.OPEN) {
                ws.value.send(JSON.stringify({ type: 'ping' }))
            }
        }, 20000)
    }

    const stopHeartbeat = () => {
        if (heartbeatInterval) {
            clearInterval(heartbeatInterval)
            heartbeatInterval = null
        }
    }

    const startWatching = async () => {
        await initSignaling()
        return remoteStream
    }

    const stopWatching = () => {
        remoteStream.value?.getTracks().forEach((track) => track.stop())
        peer.close()
        ws.value?.close()
        stopHeartbeat()
    }

    const sendDataChannelMessage = (message:any) => {
        if (dataChannel && dataChannel.readyState === 'open') {
            console.log(message)
            dataChannel.send(JSON.stringify(message))
        } else {
            console.warn('DataChannel 未连接或未打开')
        }
    }

    onBeforeUnmount(() => {
        stopWatching()
    })

    return {
        remoteStream,
        disconnected,
        startWatching,
        stopWatching,
        sendDataChannelMessage,
    }
}
