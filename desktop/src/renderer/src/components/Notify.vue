<template>
  <div class="toolbar">
    <Header :window-id="props.id" :is-hide="false" :is-min-max="false" />
    <slot></slot>
  </div>
</template>

<script setup>
import Header from './Header.vue'
const props = defineProps({
  id: {
    type: String,
    required: true
  }
})
</script>
