<script setup>
import VideoViewer from '@/components/VideoViewer.vue'
</script>

<template>
  <div class="about">
    <VideoViewer />
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
