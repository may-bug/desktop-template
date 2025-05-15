<template>
  <div class="room-controls">
    <div class="chat-container">
      <div class="messages">
        <ChatMessage
            v-for="(msg, index) in messages"
            :key="index"
            :message="msg"
            :isLocal="msg.isLocal"
        />
      </div>
      <div class="message-input">
        <input
            v-model="messageInput"
            placeholder="Type a message..."
            @keyup.enter="sendMessage"
        />
        <button @click="sendMessage">Send</button>
      </div>
    </div>

    <div class="action-buttons">
      <button
          class="leave-button"
          @click="$emit('leave-room')"
      >
        Leave Room
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import ChatMessage from './ChatMessage.vue'

export default {
  components: {
    ChatMessage
  },

  props: {
    messages: {
      type: Array,
      default: () => []
    },
    isConnected: {
      type: Boolean,
      default: false
    }
  },

  emits: ['send-message', 'leave-room'],

  setup(props, { emit }) {
    const messageInput = ref('')

    const sendMessage = () => {
      if (messageInput.value.trim() && props.isConnected) {
        emit('send-message', messageInput.value.trim())
        messageInput.value = ''
      }
    }

    return {
      messageInput,
      sendMessage
    }
  }
}
</script>

<style scoped>
.room-controls {
  display: flex;
  flex-direction: column;
  height: 300px;
  border-top: 1px solid #ddd;
}

.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.message-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #eee;
}

.message-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 8px;
}

.message-input button {
  padding: 8px 16px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-buttons {
  padding: 10px;
  text-align: right;
}

.leave-button {
  padding: 8px 16px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>