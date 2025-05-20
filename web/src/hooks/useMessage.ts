import { Client } from '@stomp/stompjs'
import emit from "./useEmit"

interface PayLoad{
    type: string
    to: string
    from: string
    timestamp :string
}
let client: Client | null = null

const connectWebControl = (token: string, deviceId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        client = new Client({
            brokerURL: `wss://server.tecgui.cn/ws/notify?token=${token}&deviceId=${deviceId}`,
            connectHeaders: {
                TECGUI: token
            },
            webSocketFactory: () =>
                new WebSocket(`wss://server.tecgui.cn/ws/notify?token=${token}&deviceId=${deviceId}`),
            onConnect: () => {
                console.log('✅ 控制端已连接 WebSocket')
                // 订阅通知通道
                client.subscribe('/user/queue/control/desktop/notify', (message) => {
                    const body = JSON.parse(message.body)
                    console.log('📩 收到控制通知：', body)
                    switch (body.type) {
                        case 'answer':
                            handleAnswer(body)
                            break
                        case 'reject':
                            handleReject(body)
                            break
                    }
                })
                resolve()
            },
            onStompError: (frame) => {
                console.error('❌ STOMP 错误:', frame)
                reject(new Error('STOMP 连接失败'))
            },
            reconnectDelay: 5000,
            debug: (str) => console.log('STOMP: ', str)
        })

        client.activate()
    })
}

const sendControlRequest = (payload:PayLoad): void => {
    if (!client || !client.connected) {
        console.error('🚫 STOMP 客户端未连接')
        return
    }

    client.publish({
        destination: `/app/control/desktop/request`,
        body: JSON.stringify(payload)
    })

    console.log('📤 已发送控制请求:', payload)
}

const handleAnswer = (val): void => {
    emit.emit('desktop', {
        type:"answer",
        body:val
    })
}
const handleReject = (val): void => {
    emit.emit('desktop', {
        type:"reject",
        body:val
    })
}

export {
    connectWebControl,
    sendControlRequest
}