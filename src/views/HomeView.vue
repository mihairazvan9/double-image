<script setup>
  import { loader } from '@/lib/loader.js'

  loader()
</script>

<template>
  <canvas id="canvas-imr-app"></canvas>
  <video src="../assets/imgs/video.mp4" id="video" autoplay loop muted style="display: none"></video>
</template>
