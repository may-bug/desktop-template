import { ref, onUnmounted } from 'vue'

export default function useWebSocket(roomId, userId) {
    const socket = ref(null)
    const isConnected = ref(false)
    const error = ref(null)

    const connect = () => {
        const token = localStorage.getItem('token') // 假设有存储的token
        const wsUrl = `wss://codelin.tecgui.cn/ws/data?token=${token}`
        // const wsUrl = `ws://localhost:8080/ws/data?token=${token}`

        socket.value = new WebSocket(wsUrl)

        socket.value.onopen = () => {
            isConnected.value = true
            console.log('WebSocket connected')
            joinRoom()
        }

        socket.value.onclose = () => {
            isConnected.value = false
            console.log('WebSocket disconnected')
        }

        socket.value.onerror = (err) => {
            error.value = err
            console.error('WebSocket error:', err)
        }
    }

    const joinRoom = () => {
        if (socket.value?.readyState === WebSocket.OPEN) {
            socket.value.send(JSON.stringify({
                type: 'join',
                roomId: roomId.value,
                userId: userId.value
            }))
        }
    }

    const sendMessage = (type, data) => {
        if (socket.value?.readyState === WebSocket.OPEN) {
            const message = {
                type,
                roomId: roomId.value,
                userId: userId.value,
                ...data
            }
            socket.value.send(JSON.stringify(message))
        }
    }

    // 心跳保持连接
    const startHeartbeat = () => {
        const interval = setInterval(() => {
            if (socket.value?.readyState === WebSocket.OPEN) {
                socket.value.send(JSON.stringify({ type: 'heartbeat' }))
            }
        }, 15000)

        onUnmounted(() => clearInterval(interval))
    }

    onUnmounted(() => {
        if (socket.value) {
            socket.value.close()
        }
    })

    return {
        socket,
        isConnected,
        error,
        connect,
        sendMessage,
        startHeartbeat
    }
}