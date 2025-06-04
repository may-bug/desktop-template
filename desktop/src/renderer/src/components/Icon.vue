<template>
  <svg aria-hidden="true" :style="{ width: props.size + 'px', height: props.size + 'px' }">
    <use :xlink:href="'#icon-' + props.name" :fill="color"></use>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    require: true
  },
  color: {
    type: String,
    default: 'currentColor'
  },
  size: {
    type: Number,
    default: 30
  }
})
const color = computed(() => {
  return props.color
})
</script>
