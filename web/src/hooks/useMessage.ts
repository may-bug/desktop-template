import { Client } from '@stomp/stompjs'

let client: Client | null = null

export const connectWebControl = (token: string, deviceId: string): Promise<void> => {
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

export const sendControlRequest = (toDeviceId: string, fromDeviceId: string): void => {
    if (!client || !client.connected) {
        console.error('🚫 STOMP 客户端未连接')
        return
    }

    const payload = {
        type: 'control_request',
        from: fromDeviceId,
        to: toDeviceId,
        timestamp: Date.now()
    }

    client.publish({
        destination: `/app/control/send`,
        body: JSON.stringify(payload)
    })

    console.log('📤 已发送控制请求:', payload)
}