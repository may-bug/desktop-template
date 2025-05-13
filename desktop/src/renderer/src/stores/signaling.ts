// src/stores/signaling.ts
import { defineStore } from 'pinia'
import { useWebSocket } from '../utils/websocket'
import type { Message, SdpMessage, IceCandidateMessage, JoinRoomRequest } from '@/models/Message'
import { ref } from 'vue'

export const useSignalingStore = defineStore('signaling', () => {
  const { socket, isConnected, connect, send, disconnect } = useWebSocket(
    'ws://localhost:8080/ws/signaling'
  )

  const currentRoom = ref<string | null>(null)
  const peers = ref<Set<string>>(new Set())
  const messages = ref<Message[]>([])

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const joinRoom = (roomId: string, userId: string) => {
    const message: JoinRoomRequest = {
      type: 'join',
      roomId,
      userId
    }
    currentRoom.value = roomId
    send(message)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const leaveRoom = () => {
    if (currentRoom.value) {
      send({ type: 'leave' })
      currentRoom.value = null
      peers.value.clear()
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const sendOffer = (to: string, sdp: RTCSessionDescription) => {
    if (!currentRoom.value) return

    const message: SdpMessage = {
      type: 'offer',
      roomId: currentRoom.value,
      from: '',
      to,
      sdp
    }
    send(message)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const sendAnswer = (to: string, sdp: RTCSessionDescription) => {
    if (!currentRoom.value) return

    const message: SdpMessage = {
      type: 'answer',
      roomId: currentRoom.value,
      from: '',
      to,
      sdp
    }
    send(message)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const sendIceCandidate = (to: string, candidate: RTCIceCandidate) => {
    if (!currentRoom.value) return

    const message: IceCandidateMessage = {
      type: 'ice-candidate',
      roomId: currentRoom.value,
      from: '',
      to,
      candidate
    }
    send(message)
  }

  // 初始化消息监听
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const initMessageHandler = () => {
    if (socket.value) {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      socket.value.onmessage = (event) => {
        const message = JSON.parse(event.data) as Message

        messages.value.push(message)

        switch (message.type) {
          case 'peer-joined':
            peers.value.add(message.from)
            break
          case 'peer-left':
            peers.value.delete(message.from)
            break
          case 'room-info': {
            const roomInfo = message as RoomInfo
            roomInfo.users.forEach((user) => peers.value.add(user.userId))
            break
          }
        }
      }
    }
  }

  return {
    socket,
    isConnected,
    currentRoom,
    peers,
    messages,
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    initMessageHandler
  }
})
