// src/models/Message.ts
export interface Message {
  type: string
  from?: string
  to?: string
}

export interface JoinRoomRequest extends Message {
  type: 'join'
  roomId: string
  userId: string
}

export interface RoomInfo extends Message {
  type: 'room-info'
  roomId: string
  users: UserInfo[]
}

export interface UserInfo {
  userId: string
}
