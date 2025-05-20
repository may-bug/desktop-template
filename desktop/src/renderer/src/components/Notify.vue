<template>
  <div class="toolbar">
    <Header :window-id="'notify'" :is-hide="false" :is-min-max="false" :title="props.title" />
    <slot></slot>
  </div>
</template>

<script setup>
import Header from './Header.vue'
const props = defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>
