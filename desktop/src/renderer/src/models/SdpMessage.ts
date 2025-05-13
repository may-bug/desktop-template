// src/models/SdpMessage.ts
import type { Message } from './Message'

export interface SdpMessage extends Message {
  type: 'offer' | 'answer'
  roomId: string
  sdp: RTCSessionDescriptionInit
}
