import { Client } from '@stomp/stompjs'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const WebSocket = require('ws')
import { createToolbarWindow, windowsContainer } from '../window/windows'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const subDesktopMessage = (token: string, deviceId: string) => {
  const client = new Client({
    brokerURL: `wss://server.tecgui.cn/ws/notify?token=${token}&deviceId=${deviceId}`, // 你后端配置的 WebSocket 端点路径
    connectHeaders: {
      TECGUI: token
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    webSocketFactory: () =>
      new WebSocket(`wss://server.tecgui.cn/ws/notify?token=${token}&deviceId=${deviceId}`),
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onConnect: (frame) => {
      console.log('🟢 WebSocket connected:', frame)

      // 订阅通知通道
      client.subscribe('/user/queue/control_notify', (message) => {
        const body = JSON.parse(message.body)
        console.log('📩 收到控制通知：', body)

        const fromDevice = body.from
        if (fromDevice && !windowsContainer['toolbar']) {
          createToolbarWindow({
            id: 'toolbar',
            title: '控制请求',
            width: 300,
            height: 100,
            url: '/toolbar'
          })
        }
      })
    },
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onStompError: (frame) => {
      console.error('❌ STOMP 错误:', frame)
    },
    reconnectDelay: 5000, // 自动重连
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    debug: (str) => console.log('STOMP: ', str)
  })

  client.activate()
}

export { subDesktopMessage }
