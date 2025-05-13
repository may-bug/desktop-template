// src/models/IceCandidateMessage.ts
import type { Message } from './Message'

export interface IceCandidateMessage extends Message {
  type: 'ice-candidate'
  roomId: string
  candidate: RTCIceCandidateInit
}
