<template>
  <div class="peer-video">
    <video
        ref="videoElement"
        autoplay
        playsinline
        :muted="isLocal"
    />
    <div class="peer-info">
      {{ userId }} {{ isLocal ? '(You)' : '' }}
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted } from 'vue'

export default {
  props: {
    stream: {
      type: MediaStream,
      default: null
    },
    userId: {
      type: String,
      required: true
    },
    isLocal: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const videoElement = ref(null)

    const updateVideoStream = () => {
      if (videoElement.value && props.stream) {
        videoElement.value.srcObject = props.stream
      }
    }

    watch(() => props.stream, updateVideoStream)

    onMounted(updateVideoStream)

    onUnmounted(() => {
      if (videoElement.value) {
        videoElement.value.srcObject = null
      }
    })

    return {
      videoElement
    }
  }
}
</script>

<style scoped>
.peer-video {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.peer-video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.peer-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 14px;
}
</style>