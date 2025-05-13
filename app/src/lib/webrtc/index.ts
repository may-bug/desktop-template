//@ts-nocheck
const configuration = {
  iceServers: [
    {
      urls: 'turn:turn.tecgui.cn:19403',
      username: 'root',
      password: 'Lin021219'
    }
  ]
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const makeCall = async () => {
  const peerConnection = new RTCPeerConnection(configuration)
  const dataChannel = peerConnection.createDataChannel()

  // 数据流打开
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dataChannel.addEventListener('open', (_event) => {})
  // 数据流关闭
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  dataChannel.addEventListener('close', (_event) => {})
  // Listen for local ICE candidates on the local RTCPeerConnection
  peerConnection.addEventListener('icecandidate', (event) => {
    if (event.candidate) {
      signalingChannel.send({ 'new-ice-candidate': event.candidate })
    }
  })
  // Listen for connectionstatechange on the local RTCPeerConnection
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  peerConnection.addEventListener('connectionstatechange', (_event) => {
    if (peerConnection.connectionState === 'connected') {
      // Peers connected!
    }
  })
  // Listen for remote ICE candidates and add them to the local RTCPeerConnection
  signalingChannel.addEventListener('message', async (message) => {
    if (message.iceCandidate) {
      try {
        await peerConnection.addIceCandidate(message.iceCandidate)
      } catch (e) {
        console.error('Error adding received ice candidate', e)
      }
    }
    if (message.answer) {
      const remoteDesc = new RTCSessionDescription(message.answer)
      await peerConnection.setRemoteDescription(remoteDesc)
    }
  })
  const offer = await peerConnection.createOffer()
  await peerConnection.setLocalDescription(offer)
  signalingChannel.send({ offer: offer })
}

export { makeCall, peerConnection, signalingChannel }
