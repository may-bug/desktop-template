<template>
  <div :class="['message', { local: isLocal }]">
    <div class="sender">{{ message.sender }}</div>
    <div class="content">{{ message.content }}</div>
    <div class="time">{{ formattedTime }}</div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  props: {
    message: {
      type: Object,
      required: true
    },
    isLocal: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const formattedTime = computed(() => {
      return props.message.timestamp?.toLocaleTimeString() || ''
    })

    return {
      formattedTime
    }
  }
}
</script>

<style scoped>
.message {
  margin-bottom: 10px;
  padding: 8px 12px;
  background: #f0f0f0;
  border-radius: 8px;
  max-width: 80%;
}

.message.local {
  margin-left: auto;
  background: #e3f2fd;
}

.sender {
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 4px;
}

.content {
  word-wrap: break-word;
}

.time {
  font-size: 10px;
  color: #666;
  text-align: right;
  margin-top: 4px;
}
</style>