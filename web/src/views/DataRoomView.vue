<template>
  <div class="webrtc-container">
    <!-- 顶部标题栏 -->
    <header class="app-header">
      <h1><i class="fas fa-video"></i> WebRTC 通信系统</h1>
      <div class="user-status" v-if="username">
        <span class="status-indicator" :class="{ connected: stompClient?.connected }"></span>
        {{ username }}
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="app-main">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <!-- 用户登录区域 -->
        <div class="login-card card">
          <div v-if="!userStatus">
            <h3><i class="fas fa-sign-in-alt"></i> 用户登录</h3>
            <div class="input-group">
              <input v-model="username" placeholder="输入用户名">
              <button class="primary" @click="connectToSignaling">
                <i class="fas fa-plug"></i> 连接
              </button>
            </div>
            <p class="hint">请输入用户名连接信令服务器</p>
          </div>
          <div v-else class="welcome-message">
            <h3>欢迎, {{ username }}!</h3>
            <p>已连接到信令服务器</p>
            <button class="secondary" @click="disconnect">
              <i class="fas fa-sign-out-alt"></i> 退出登录
            </button>
          </div>
        </div>

        <!-- 在线用户列表 -->
        <div class="user-list-card card" v-if="onlineUsers">
          <div class="card-header">
            <h3><i class="fas fa-users"></i> 在线用户</h3>
            <span class="badge">{{ onlineUsers.length }}</span>
          </div>
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input v-model="userSearch" placeholder="搜索用户...">
          </div>
          <ul class="user-list">
            <li v-for="user in filteredUsers" :key="user">
              <div class="user-item" :class="{ active: currentPeer === user }">
                <span class="user-avatar">
                  <i class="fas fa-user"></i>
                </span>
                <span class="user-name">{{ user }}</span>
                <div class="user-actions" v-if="user !== username && !currentPeer">
                  <button class="icon-btn" @click="startCall(user, 'data')" title="文字聊天">
                    <i class="fas fa-comment"></i>
                  </button>
                  <button class="icon-btn" @click="startCall(user, 'audio')" title="语音通话">
                    <i class="fas fa-phone"></i>
                  </button>
                  <button class="icon-btn" @click="startCall(user, 'video')" title="视频通话">
                    <i class="fas fa-video"></i>
                  </button>
                </div>
                <span class="call-status" v-if="currentPeer === user">
                  <i class="fas fa-phone-volume"></i> 通话中
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- 右侧主区域 -->
      <div class="right-panel">
        <!-- 通话状态区域 -->
        <div class="status-card card" v-if="status">
          <div class="status-content">
            <i class="fas fa-info-circle status-icon"></i>
            <p>{{ status }}</p>
          </div>
          <div v-if="incomingCall" class="incoming-call">
            <div class="caller-info">
              <i class="fas fa-user"></i>
              <span>{{ incomingCall.sender }}</span>
            </div>
            <p>邀请您 {{ getCallTypeName(incomingCall.callType) }}</p>
            <div class="call-actions">
              <button class="accept-btn" @click="acceptCall">
                <i class="fas fa-check"></i> 接受
              </button>
              <button class="reject-btn" @click="rejectCall">
                <i class="fas fa-times"></i> 拒绝
              </button>
            </div>
          </div>
        </div>

        <!-- 文字聊天区域 -->
        <div v-if="webrtc && connected && currentCallType === 'data'" class="chat-card card">
          <div class="chat-header">
            <h3><i class="fas fa-comments"></i> 与 {{ currentPeer }} 的聊天</h3>
            <button class="end-call-btn" @click="endCall">
              <i class="fas fa-phone-slash"></i> 结束
            </button>
          </div>
          <div class="message-container">
            <div v-for="(msg, index) in receivedMessages" :key="index"
                 :class="['message', msg.sender === username ? 'sent' : 'received']">
              <div class="message-header">
                <span class="sender">{{ msg.sender }}</span>
                <span class="time">{{ formatTime(msg.timestamp) }}</span>
              </div>
              <p class="message-text">{{ msg.text }}</p>
            </div>
          </div>
          <div class="message-input">
            <input v-model="message" placeholder="输入消息..." @keyup.enter="sendMessage">
            <button class="send-btn" @click="sendMessage">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>

        <!-- 音视频区域 -->
        <div v-if="webrtc && connected && (currentCallType === 'audio' || currentCallType === 'video')"
             class="media-card card">
          <div class="media-header">
            <h3>
              <i :class="currentCallType === 'audio' ? 'fas fa-phone' : 'fas fa-video'"></i>
              与 {{ currentPeer }} 的{{ getCallTypeName(currentCallType) }}
            </h3>
            <div class="call-duration">{{ callDuration }}</div>
            <button class="end-call-btn" @click="endCall">
              <i class="fas fa-phone-slash"></i> 结束
            </button>
          </div>
          <div class="video-container" :class="{ 'audio-only': currentCallType === 'audio' }">
            <div class="video-wrapper">
              <video ref="remoteVideo" autoplay playsinline></video>
              <div class="video-label">对方画面</div>
              <div class="call-controls">
                <button @click="toggleMute" :class="{ active: muted }">
                  <i :class="muted ? 'fas fa-microphone-slash' : 'fas fa-microphone'"></i>
                </button>
                <button @click="toggleVideo" v-if="currentCallType === 'video'" :class="{ active: videoOff }">
                  <i :class="videoOff ? 'fas fa-video-slash' : 'fas fa-video'"></i>
                </button>
              </div>
            </div>
            <div class="video-wrapper local-video" v-if="currentCallType === 'video'">
              <video ref="localVideo" autoplay muted playsinline></video>
              <div class="video-label">我的画面</div>
            </div>
          </div>
        </div>

        <!-- 默认欢迎视图 -->
        <div v-if="!currentPeer" class="welcome-card card">
          <div class="welcome-content">
            <img src="../assets/video-call.svg" alt="Video Call" class="welcome-image">
            <h2>开始您的WebRTC通信</h2>
            <p>从左侧用户列表中选择一个联系人开始文字、语音或视频聊天</p>
            <div class="features">
              <div class="feature">
                <i class="fas fa-comment"></i>
                <span>实时文字聊天</span>
              </div>
              <div class="feature">
                <i class="fas fa-phone"></i>
                <span>高清语音通话</span>
              </div>
              <div class="feature">
                <i class="fas fa-video"></i>
                <span>流畅视频通话</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 错误提示 -->
    <transition name="fade">
      <div v-if="error" class="error-toast">
        <i class="fas fa-exclamation-circle"></i>
        <span>{{ error }}</span>
        <button class="close-btn" @click="error = null">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import {ref, computed, onBeforeUnmount, watch, onMounted} from 'vue';
import { useWebRTC } from '../composables/useWebRTC';
import Stomp from 'webstomp-client';
import SockJS from 'sockjs-client';
import { format } from 'date-fns';

// 添加Font Awesome CSS
const addFontAwesome = () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
  document.head.appendChild(link);
};

onMounted(() => {
  addFontAwesome();
});

const {
  webrtc,
  connected,
  currentPeer,
  currentCallType,
  incomingCall,
  receivedMessages,
  localStream,
  remoteStream,
  muted,
  videoOff,
  init,
  setupMedia,
  sendMessage: sendWebRTCMessage,
  toggleMute,
  toggleVideo,
  cleanup
} = useWebRTC();

const username = ref('');
const onlineUsers = ref([]);
const userSearch = ref('');
const message = ref('');
const status = ref('');
const error = ref(null);
const stompClient = ref(null);
const localVideo = ref(null);
const remoteVideo = ref(null);
const callStartTime = ref(null);
const callDuration = ref('00:00');
const userStatus=ref(false)

// 计算属性：过滤用户列表
const filteredUsers = computed(() => {
  if (!userSearch.value) return onlineUsers.value;
  return onlineUsers.value.filter(user =>
      user.toLowerCase().includes(userSearch.value.toLowerCase())
  );
});

// 格式化时间
const formatTime = (timestamp) => {
  return format(new Date(timestamp), 'HH:mm');
};

// 更新通话时长
const updateCallDuration = () => {
  if (callStartTime.value && currentPeer.value) {
    const now = new Date();
    const diff = now - callStartTime.value;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    callDuration.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    callDuration.value = '00:00';
  }
};

// 连接信令服务器
const connectToSignaling = async () => {
  if (!username.value.trim()) {
    error.value = '请输入用户名';
    return;
  }

  status.value = '正在连接信令服务器...';

  try {
    const socket = new SockJS(`https://server.tecgui.cn/ws/data?userId=${username.value}`);
    stompClient.value = Stomp.over(socket);

    const headers = {
      'userId': username.value,
      'heart-beat': '10000,10000',
      'simpSessionId': `frontend-${Date.now()}`
    };

    stompClient.value.connect(headers, () => {
      status.value = '已连接信令服务器';

      // 订阅各种频道
      subscribeToChannels();

      // 加入房间
      sendSignal({
        type: 'join',
        sender: username.value
      });
    }, (err) => {
      error.value = `信令服务器连接失败: ${err}`;
      status.value = '连接失败';
      console.error('WebSocket error:', err);
    });
  } catch (err) {
    handleError(err);
  }
};

// 订阅所有需要的频道
const subscribeToChannels = () => {
  // 订阅用户列表
  stompClient.value.subscribe('/topic/users', (message) => {
    onlineUsers.value = JSON.parse(message.body);
  });

  // 订阅通话请求
  stompClient.value.subscribe(`/user/queue/call-request`, (message) => {
    const request = JSON.parse(message.body);
    incomingCall.value = {
      sender: request.sender,
      callType: request.data.callType
    };
    status.value = `${request.sender} 邀请您 ${getCallTypeName(request.data.callType)}`;

    // 播放来电铃声
    playRingtone();
  });

  // 订阅通话接受
  stompClient.value.subscribe('/user/queue/call-accepted', (message) => {
    const accepted = JSON.parse(message.body);
    status.value = `${accepted.sender} 已接受通话`;
    stopRingtone();
  });

  // 订阅通话拒绝
  stompClient.value.subscribe('/user/queue/call-rejected', (message) => {
    const rejected = JSON.parse(message.body);
    status.value = `${rejected.sender} 拒绝了通话: ${rejected.data?.reason || ''}`;
    cleanup();
    stopRingtone();
  });

  // 订阅通话结束
  stompClient.value.subscribe('/user/queue/call-ended', (message) => {
    const ended = JSON.parse(message.body);
    status.value = `${ended.sender} 已结束通话`;
    cleanup();
  });

  // 订阅WebRTC信令
  stompClient.value.subscribe('/user/queue/signal', (message) => {
    const signal = JSON.parse(message.body);
    handleWebRTCSignal(signal);
  });
};

// 播放来电铃声
const playRingtone = () => {
  // 这里可以添加播放铃声的逻辑
};

// 停止来电铃声
const stopRingtone = () => {
  // 这里可以添加停止铃声的逻辑
};

// 断开连接
const disconnect = () => {
  if (stompClient.value?.connected) {
    sendSignal({
      type: 'leave',
      sender: username.value
    });
    stompClient.value.disconnect();
  }
  username.value = '';
  cleanup();
};

// 处理WebRTC信令
const handleWebRTCSignal = async (signal) => {
  if (!webrtc.value) return;

  try {
    switch(signal.type) {
      case 'offer':
        await webrtc.value.setRemoteDescription(signal.data);
        const answer = await webrtc.value.createAnswer();
        sendSignal({
          type: 'answer',
          sender: username.value,
          receiver: currentPeer.value,
          data: answer
        });
        break;
      case 'answer':
        await webrtc.value.setRemoteDescription(signal.data);
        break;
      case 'candidate':
        await webrtc.value.addIceCandidate(signal.data);
        break;
    }
  } catch (error) {
    console.error('Error handling signal:', error);
    handleError(error);
  }
};

// 发起通话
const startCall = async (peer, callType) => {
  if (webrtc.value) return;

  currentPeer.value = peer;
  callStartTime.value = new Date();
  status.value = `正在发起${getCallTypeName(callType)}...`;

  const rtc = init(true, callType);

  try {
    if (callType !== 'data') {
      await setupMedia(callType);
    }

    rtc.on('offerCreated', async (offer) => {
      sendSignal({
        type: 'offer',
        sender: username.value,
        receiver: peer,
        data: {
          type: 'offer',
          sdp: offer.sdp,
          callType
        }
      });
    });
  } catch (error) {
    handleError(error);
    endCall();
  }
};

// 接受通话
const acceptCall = async () => {
  if (!incomingCall.value) return;

  currentPeer.value = incomingCall.value.sender;
  callStartTime.value = new Date();
  status.value = `正在接受${getCallTypeName(incomingCall.value.callType)}...`;

  const rtc = init(false, incomingCall.value.callType);

  try {
    if (incomingCall.value.callType !== 'data') {
      await setupMedia(incomingCall.value.callType);
    }

    // 通知对方已接受
    sendSignal({
      type: 'accept',
      sender: username.value,
      receiver: currentPeer.value
    });

    incomingCall.value = null;
  } catch (error) {
    handleError(error);
    endCall();
  }
};

// 拒绝通话
const rejectCall = () => {
  if (!incomingCall.value) return;

  sendSignal({
    type: 'reject',
    sender: username.value,
    receiver: incomingCall.value.sender,
    data: {
      reason: '用户拒绝通话'
    }
  });

  incomingCall.value = null;
  status.value = '已拒绝通话请求';
  stopRingtone();
};

// 结束通话
const endCall = () => {
  if (currentPeer.value) {
    sendSignal({
      type: 'call-ended',
      sender: username.value,
      receiver: currentPeer.value
    });
  }
  cleanup();
  status.value = '通话已结束';
  callStartTime.value = null;
  stopRingtone();
};

// 发送消息
const sendMessage = () => {
  if (!message.value.trim() || !webrtc.value || !connected.value) return;

  sendWebRTCMessage(message.value, username.value);
  message.value = '';
};

// 发送信令
const sendSignal = (signal) => {
  if (stompClient.value?.connected) {
    stompClient.value.send('/app/signal', JSON.stringify({
      ...signal,
      timestamp: Date.now()
    }));
  }
};

// 错误处理
const handleError = (error) => {
  console.error('Error:', error);
  error.value = error.message || '未知错误';
  status.value = `错误: ${error.value}`;
};

const getCallTypeName = (type) => {
  const types = {
    data: '文字聊天',
    audio: '语音通话',
    video: '视频通话'
  };
  return types[type] || type;
};

// 设置通话时长定时器
let durationInterval;
watch(currentPeer, (newVal) => {
  if (newVal) {
    callStartTime.value = new Date();
    durationInterval = setInterval(updateCallDuration, 1000);
  } else {
    clearInterval(durationInterval);
    callDuration.value = '00:00';
  }
});

// 自动清除错误消息
watch(error, (value) => {
  if (value !== null) {
    setTimeout(() => {
      error.value = null;
    }, 5000);
  }
});

// 清理资源
onBeforeUnmount(() => {
  disconnect();
  cleanup();
  clearInterval(durationInterval);
});
</script>

<style scoped>
/* 基础样式 */
:root {
  --primary-color: #4a6bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  --light-color: #f8f9fa;
  --dark-color: #343a40;
  --border-radius: 8px;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f7fa;
}

/* 容器样式 */
.webrtc-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: var(--box-shadow);
}

/* 头部样式 */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ccc;
}

.status-indicator.connected {
  background-color: var(--success-color);
}

/* 主内容区域 */
.app-main {
  display: flex;
  flex: 1;
  padding: 1.5rem;
  gap: 1.5rem;
}

.left-panel {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 卡片通用样式 */
.card {
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1.5rem;
  transition: var(--transition);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: var(--dark-color);
}

.badge {
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

/* 登录卡片 */
.login-card {
  text-align: center;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}

.input-group input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: var(--transition);
}

.input-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(74, 107, 255, 0.2);
}

.hint {
  font-size: 0.85rem;
  color: var(--secondary-color);
  margin-top: 0.5rem;
}

.welcome-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.welcome-message h3 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

/* 用户列表卡片 */
.user-list-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--secondary-color);
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 0.9rem;
}

.user-list {
  flex: 1;
  overflow-y: auto;
  list-style: none;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
  transition: var(--transition);
  margin-bottom: 0.5rem;
}

.user-item:hover {
  background-color: #f8f9fa;
}

.user-item.active {
  background-color: rgba(74, 107, 255, 0.1);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  color: var(--primary-color);
}

.user-name {
  flex: 1;
  font-weight: 500;
}

.user-actions {
  display: flex;
  gap: 0.25rem;
}

.call-status {
  font-size: 0.8rem;
  color: var(--success-color);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

/* 状态卡片 */
.status-card {
  background-color: #f8f9fa;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-icon {
  color: var(--info-color);
  font-size: 1.2rem;
}

.incoming-call {
  text-align: center;
  margin-top: 1rem;
  padding: 1rem;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.caller-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.caller-info i {
  color: var(--primary-color);
}

.call-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

/* 按钮样式 */
button {
  cursor: pointer;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary {
  background-color: var(--primary-color);
  color: black;
}

.primary:hover {
  background-color: #3a5bef;
  color: white;
}

.secondary {
  background-color: var(--light-color);
  color: var(--dark-color);
}

.secondary:hover {
  background-color: #e9ecef;
}

.accept-btn {
  background-color: var(--success-color);
  color: white;
}

.accept-btn:hover {
  background-color: #218838;
}

.reject-btn {
  background-color: var(--danger-color);
  color: white;
}

.reject-btn:hover {
  background-color: #c82333;
}

.icon-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  justify-content: center;
  background-color: transparent;
  color: var(--secondary-color);
}

.icon-btn:hover {
  background-color: #f1f3f5;
  color: var(--primary-color);
}

.end-call-btn {
  background-color: var(--danger-color);
  color: white;
}

.end-call-btn:hover {
  background-color: #c82333;
}

/* 聊天卡片 */
.chat-card {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.message-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: var(--border-radius);
  margin-bottom: 1rem;
}

.message {
  max-width: 80%;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
  position: relative;
}

.message.sent {
  background-color: var(--primary-color);
  color: white;
  margin-left: auto;
  border-bottom-right-radius: 0;
}

.message.received {
  background-color: white;
  border: 1px solid #eee;
  margin-right: auto;
  border-bottom-left-radius: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.message.sent .message-header {
  color: rgba(255, 255, 255, 0.8);
}

.message.received .message-header {
  color: var(--secondary-color);
}

.sender {
  font-weight: 500;
  font-size: 0.85rem;
}

.time {
  font-size: 0.75rem;
}

.message-text {
  word-wrap: break-word;
}

.message-input {
  display: flex;
  gap: 0.5rem;
}

.message-input input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
}

.send-btn {
  width: 48px;
  height: 48px;
  padding: 0;
  justify-content: center;
  background-color: var(--primary-color);
  color: white;
}

.send-btn:hover {
  background-color: #3a5bef;
}

/* 媒体卡片 */
.media-card {
  flex: 1;
}

.media-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.call-duration {
  font-weight: 500;
  color: var(--primary-color);
}

.video-container {
  flex: 1;
  display: flex;
  gap: 1rem;
  position: relative;
}

.video-container.audio-only {
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: var(--border-radius);
  min-height: 300px;
}

.video-container.audio-only::before {
  content: "\f2a0"; /* Font Awesome phone icon */
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  font-size: 5rem;
  color: var(--primary-color);
  opacity: 0.2;
}

.video-wrapper {
  flex: 1;
  position: relative;
  background-color: #000;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.video-wrapper video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-label {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.local-video {
  position: absolute;
  width: 25%;
  height: 25%;
  bottom: 1rem;
  right: 1rem;
  border: 2px solid white;
  border-radius: var(--border-radius);
  z-index: 10;
}

.call-controls {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 10;
}

.call-controls button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  color: white;
  font-size: 1.2rem;
}

.call-controls button:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.call-controls button.active {
  background-color: var(--danger-color);
}

/* 欢迎卡片 */
.welcome-card {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.welcome-content {
  max-width: 500px;
  padding: 2rem;
}

.welcome-image {
  width: 200px;
  height: auto;
  margin-bottom: 2rem;
}

.welcome-card h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.welcome-card p {
  font-size: 1.1rem;
  color: var(--secondary-color);
  margin-bottom: 2rem;
}

.features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.feature i {
  font-size: 1.5rem;
  color: var(--primary-color);
}

/* 错误提示 */
.error-toast {
  border-radius: 12px;
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--danger-color);
  color: black;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  z-index: 1000;
}

.close-btn {
  background: none;
  color: inherit;
  padding: 0;
  margin-left: 0.5rem;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .app-main {
    flex-direction: column;
  }

  .left-panel {
    flex: 0 0 auto;
  }

  .video-container {
    flex-direction: column;
  }

  .local-video {
    width: 30%;
    height: 30%;
  }
}

@media (max-width: 576px) {
  .app-header {
    padding: 1rem;
  }

  .app-main {
    padding: 1rem;
  }

  .card {
    padding: 1rem;
  }

  .features {
    flex-direction: column;
    gap: 1rem;
  }

  .local-video {
    width: 40%;
    height: 40%;
  }
}
</style>