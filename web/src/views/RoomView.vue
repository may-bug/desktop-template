<!--<template>-->
<!--  <div class="room-container">-->
<!--    <div class="video-grid">-->
<!--      &lt;!&ndash; 本地视频 &ndash;&gt;-->
<!--      <PeerVideo-->
<!--          :stream="localStream"-->
<!--          :userId="userId"-->
<!--          :isLocal="true"-->
<!--      />-->

<!--      &lt;!&ndash; 远程视频 &ndash;&gt;-->
<!--      <PeerVideo-->
<!--          v-for="(stream, peerId) in remoteStreams"-->
<!--          :key="peerId"-->
<!--          :stream="stream"-->
<!--          :userId="peerId"-->
<!--      />-->
<!--    </div>-->

<!--    <RoomControls-->
<!--        :messages="messages"-->
<!--        :isConnected="isConnected"-->
<!--        @send-message="sendChatMessage"-->
<!--        @leave-room="toList"-->
<!--        @toggle-chat="toggleChat"-->
<!--        @toggle-video="toggleVideo"-->
<!--        @toggle-mic="toggleMic"-->
<!--        :showChat="showChat"-->
<!--    />-->
<!--  </div>-->
<!--</template>-->

<!--<script setup>-->
<!--import {ref, onMounted, computed, onUnmounted} from 'vue'-->
<!--import {useRoute, useRouter} from 'vue-router'-->
<!--import useWebSocket from '../composables/useWebSocket'-->
<!--import useWebRTC from '../composables/useWebRTC'-->
<!--import PeerVideo from '../components/PeerVideo.vue'-->
<!--import RoomControls from '../components/RoomControls.vue'-->
<!--import {roomLeave} from "../api/room.js";-->

<!--const route = useRoute()-->
<!--const router = useRouter()-->

<!--const roomId = computed(() => route.params.roomId)-->
<!--const userId = ref(`user_${Math.random().toString(36).substr(2, 9)}`)-->
<!--const messages = ref([])-->
<!--const showChat = ref(false)-->
<!--const videoEnabled = ref(true)-->
<!--const micEnabled = ref(true)-->
<!--const isMobile = ref(false)-->

<!--// 检测移动设备-->
<!--const checkMobile = () => {-->
<!--  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)-->
<!--}-->

<!--// 初始化WebSocket-->
<!--const {socket, isConnected, error, connect, sendMessage, startHeartbeat} =-->
<!--    useWebSocket(roomId, userId)-->

<!--// 初始化WebRTC-->
<!--const {-->
<!--  localStream,-->
<!--  remoteStreams,-->
<!--  initLocalStream,-->
<!--  handleNewPeer,-->
<!--  handleOffer,-->
<!--  handleAnswer,-->
<!--  handleIceCandidate,-->
<!--  cleanupPeer,-->
<!--  toggleVideoTrack,-->
<!--  toggleAudioTrack-->
<!--} = useWebRTC(userId, {sendMessage})-->

<!--// 加入房间-->
<!--const joinRoom = async () => {-->
<!--  checkMobile()-->

<!--  const mediaSuccess = await initLocalStream()-->
<!--  if (!mediaSuccess) {-->
<!--    alert('Could not access camera/microphone')-->
<!--    return-->
<!--  }-->

<!--  connect()-->
<!--  startHeartbeat()-->

<!--  // 设置消息处理器-->
<!--  socket.value.onmessage = (event) => {-->
<!--    const message = JSON.parse(event.data)-->

<!--    switch (message.type) {-->
<!--      case 'new-peer':-->
<!--        handleNewPeer(message.userId)-->
<!--        break-->
<!--      case 'offer':-->
<!--        handleOffer(message.senderId, message.offer)-->
<!--        break-->
<!--      case 'answer':-->
<!--        handleAnswer(message.senderId, message.answer)-->
<!--        break-->
<!--      case 'ice-candidate':-->
<!--        handleIceCandidate(message.senderId, message.candidate)-->
<!--        break-->
<!--      case 'message':-->
<!--        messages.value.push({-->
<!--          sender: message.senderId,-->
<!--          content: message.content,-->
<!--          timestamp: new Date()-->
<!--        })-->
<!--        break-->
<!--      case 'peer-left':-->
<!--        cleanupPeer(message.userId)-->
<!--        break-->
<!--      case 'error':-->
<!--        console.error('Server error:', message.error)-->
<!--        break-->
<!--    }-->
<!--  }-->
<!--}-->

<!--// 发送聊天消息-->
<!--const sendChatMessage = (content) => {-->
<!--  sendMessage('message', {content})-->
<!--  messages.value.push({-->
<!--    sender: userId.value,-->
<!--    content,-->
<!--    timestamp: new Date(),-->
<!--    isLocal: true-->
<!--  })-->
<!--}-->

<!--// 切换聊天窗口-->
<!--const toggleChat = () => {-->
<!--  showChat.value = !showChat.value-->
<!--}-->

<!--// 切换视频-->
<!--const toggleVideo = () => {-->
<!--  videoEnabled.value = !videoEnabled.value-->
<!--  toggleVideoTrack(videoEnabled.value)-->
<!--}-->

<!--// 切换麦克风-->
<!--const toggleMic = () => {-->
<!--  micEnabled.value = !micEnabled.value-->
<!--  toggleAudioTrack(micEnabled.value)-->
<!--}-->

<!--const toList=()=>{-->
<!--  router.push("/room/list")-->
<!--}-->

<!--// 离开房间-->
<!--const leaveRoom = () => {-->
<!--  roomLeave(roomId.value, {}).then((response) => {-->
<!--    if (response.code === 200) {-->
<!--      console.log("leave room")-->
<!--    }-->
<!--  })-->

<!--  if (socket.value) {-->
<!--    socket.value.close()-->
<!--  }-->
<!--  router.push('/room/list')-->
<!--}-->

<!--onMounted(joinRoom)-->
<!--onUnmounted(()=>{-->
<!--  leaveRoom()-->
<!--})-->
<!--</script>-->

<!--<style scoped>-->
<!--.room-container {-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  height: 100vh;-->
<!--  position: relative;-->
<!--  overflow: hidden;-->
<!--}-->

<!--.video-grid {-->
<!--  flex: 1;-->
<!--  display: grid;-->
<!--  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));-->
<!--  gap: 10px;-->
<!--  padding: 10px;-->
<!--  background: #f0f0f0;-->
<!--  overflow-y: auto;-->
<!--}-->

<!--/* 移动端样式 */-->
<!--@media (max-width: 768px) {-->
<!--  .video-grid {-->
<!--    grid-template-columns: 1fr;-->
<!--    padding: 5px;-->
<!--    gap: 5px;-->
<!--  }-->

<!--  .room-container {-->
<!--    padding-bottom: 60px; /* 为底部控制栏留出空间 */-->
<!--  }-->
<!--}-->

<!--.mobile-controls {-->
<!--  position: fixed;-->
<!--  bottom: 0;-->
<!--  left: 0;-->
<!--  right: 0;-->
<!--  display: flex;-->
<!--  justify-content: space-around;-->
<!--  align-items: center;-->
<!--  padding: 10px;-->
<!--  background: rgba(0, 0, 0, 0.7);-->
<!--  z-index: 100;-->
<!--}-->

<!--.mobile-controls button {-->
<!--  background: transparent;-->
<!--  border: none;-->
<!--  color: white;-->
<!--  font-size: 24px;-->
<!--  padding: 10px;-->
<!--  border-radius: 50%;-->
<!--  width: 50px;-->
<!--  height: 50px;-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--}-->

<!--.mobile-controls .leave-btn {-->
<!--  background: #ff5c5c;-->
<!--}-->

<!--.icon {-->
<!--  display: inline-block;-->
<!--  width: 24px;-->
<!--  height: 24px;-->
<!--  background-size: contain;-->
<!--  background-repeat: no-repeat;-->
<!--}-->

<!--/* 横屏时的视频布局 */-->
<!--@media (orientation: landscape) and (max-width: 768px) {-->
<!--  .video-grid {-->
<!--    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));-->
<!--  }-->
<!--}-->
<!--</style>-->

<template></template>