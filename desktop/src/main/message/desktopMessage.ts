import { store } from '../store'

export interface PayLoad {
  type: string
  to: string
  from: string
  timestamp: string
}

import { Client } from '@stomp/stompjs'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const WebSocket = require('ws')
import { createNotifyWindow, windowsContainer } from '../window/windows'
import { ipcMain } from 'electron'
let client: Client | null = null
const PAYLOAD = {
  type: 'payload',
  to: '',
  from: '',
  timestamp: Date.now()
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const subDesktopMessage = (token: string, deviceId: string) => {
  client = new Client({
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
      client.subscribe('/user/queue/control/desktop/notify', (message) => {
        const body = JSON.parse(message.body)
        console.log('📩 收到控制通知：', body)
        switch (body.type) {
          case 'request':
            handelRequest(body)
            break
          case 'answer':
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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const handelRequest = (body) => {
  const fromDevice = body.from
  PAYLOAD.from = body.from
  PAYLOAD.to = body.to
  store.set('desktop.to', body.to)
  store.set('desktop.from', body.from)
  if (fromDevice && !windowsContainer['toolbar']) {
    createNotifyWindow({
      id: 'toolbar',
      title: '控制请求',
      width: 300,
      height: 200,
      timeout: 80 * 1000
    })
  }
}

const sendControlRequest = (payload: PayLoad): void => {
  if (!client || !client.connected) {
    console.error('🚫 STOMP 客户端未连接')
    return
  }
  if (payload.to == undefined || payload.to == '') {
    payload.to = PAYLOAD.to
  }
  if (payload.from == undefined || payload.from == '') {
    payload.from = PAYLOAD.from
  }
  payload.timestamp = Date.now()

  client.publish({
    destination: `/app/control/desktop/request`,
    body: JSON.stringify(payload)
  })

  console.log('📤 已发送控制请求:', payload)
}

export { subDesktopMessage, sendControlRequest }
