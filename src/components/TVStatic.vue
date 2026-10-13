<template>
  <div class="tv-static-overlay">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const canvas = ref<HTMLCanvasElement | null>(null);
let animationId: number | null = null;

const drawStatic = () => {
  if (!canvas.value) return;

  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  const width = canvas.value.width;
  const height = canvas.value.height;

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const color = Math.random() * 180; // Darker: 0-180 instead of 0-255
    data[i] = color;     // red
    data[i + 1] = color; // green
    data[i + 2] = color; // blue
    data[i + 3] = 255;   // alpha
  }

  ctx.putImageData(imageData, 0, 0);

  animationId = requestAnimationFrame(drawStatic);
};

onMounted(() => {
  if (!canvas.value) return;

  canvas.value.width = window.innerWidth;
  canvas.value.height = window.innerHeight;

  drawStatic();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
</script>

<style scoped>
.tv-static-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  pointer-events: none;
}

canvas {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}
</style>
