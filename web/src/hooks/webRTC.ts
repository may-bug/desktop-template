import { ref, onBeforeUnmount } from 'vue'

interface UseWebRTCShareOptions {
    signalingUrl: string
    token: string
    uid: string
    deviceId: string
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

    const maxReconnectAttempts = 5
    let reconnectAttempts = 0
    let heartbeatInterval: ReturnType<typeof setInterval> | null = null
    let hasSentOffer = false

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
                reconnectAttempts = 0
                startHeartbeat()
                resolve()
            }

            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            ws.value.onmessage = async (event) => {
                const msg = JSON.parse(event.data)

                if (msg.type === 'answer') {
                    await peer.setRemoteDescription(new RTCSessionDescription(msg.answer))
                } else if (msg.type === 'candidate') {
                    await peer.addIceCandidate(new RTCIceCandidate(msg.candidate))
                } else if (msg.type === 'pong') {
                    // pong received
                }
            }

            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            ws.value.onerror = () => {
                console.warn('WebSocket error, will attempt reconnect...')
            }

            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            ws.value.onclose = () => {
                console.warn('WebSocket closed')
                stopHeartbeat()
                disconnected.value = true

                if (reconnectAttempts < maxReconnectAttempts) {
                    setTimeout(() => {
                        reconnectAttempts++
                        initSignaling().then(() => {
                            if (!hasSentOffer) {
                                createAndSendOffer()
                            }
                        })
                    }, 2000)
                }
            }

            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            peer.onicecandidate = (e) => {
                if (e.candidate) {
                    sendSignal({
                        type: 'candidate',
                        to: options.deviceId,
                        candidate: e.candidate
                    })
                }
            }
        })
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const createAndSendOffer = async () => {
        const offer = await peer.createOffer()
        await peer.setLocalDescription(offer)
        hasSentOffer = true

        sendSignal({
            type: 'offer',
            from: options.uid,
            to: options.deviceId,
            offer
        })
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

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const startSharing = async () => {
        await initSignaling()
        await createAndSendOffer()

        return localStream
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const stopSharing = () => {
        localStream.value?.getTracks().forEach((track) => track.stop())
        peer.close()
        ws.value?.close()
        stopHeartbeat()
        hasSentOffer = false
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
