export class WebRTCDataChannel {
  constructor(options = {}) {
    this.defaultOptions = {
      iceServers: [{ urls: 'turn:turn.tecgui.cn:3478', username: 'root', password: 'Lin021219' }],
      dataChannelConfig: {
        ordered: true,
        maxPacketLifeTime: 3000
      }
    }

    this.options = { ...this.defaultOptions, ...options }
    this.peerConnection = null
    this.dataChannel = null
    this.listeners = {
      open: [],
      close: [],
      error: [],
      message: [],
      icecandidate: [],
      offerCreated: [],
      stream: []
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  init(isInitiator) {
    this.peerConnection = new RTCPeerConnection(this.options.iceServers)
    this.isInitiator = isInitiator

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit('icecandidate', event.candidate)
      }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection.iceConnectionState
      if (state === 'connected' || state === 'completed') {
        this.emit('open')
      } else if (state === 'disconnected' || state === 'failed') {
        this.emit('close')
      }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    this.peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.emit('stream', event.streams[0])
      }
    }

    if (isInitiator) {
      this.dataChannel = this.peerConnection.createDataChannel(
        'dataChannel',
        this.options.dataChannelConfig
      )
      this.setupDataChannel()

      this.createOffer().then((offer) => {
        this.emit('offerCreated', offer)
      })
    } else {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      this.peerConnection.ondatachannel = (event) => {
        this.dataChannel = event.channel
        this.setupDataChannel()
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  setupDataChannel() {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    this.dataChannel.onopen = () => this.emit('open')
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    this.dataChannel.onclose = () => this.emit('close')
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    this.dataChannel.onerror = (error) => this.emit('error', error)
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    this.dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.emit('message', data)
      } catch (error) {
        console.error('Failed to parse message:', error)
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async createOffer() {
    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)
    return offer
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async createAnswer() {
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    return answer
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async setRemoteDescription(description) {
    await this.peerConnection.setRemoteDescription(description)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async addIceCandidate(candidate) {
    await this.peerConnection.addIceCandidate(candidate)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  send(message) {
    if (this.dataChannel?.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(message))
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  close() {
    if (this.dataChannel) {
      this.dataChannel.close()
    }
    if (this.peerConnection) {
      this.peerConnection.close()
    }
    this.emit('close')
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter((cb) => cb !== callback)
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(...args))
    }
  }
}
