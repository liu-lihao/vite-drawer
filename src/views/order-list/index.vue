<script setup lang="ts">
import { onMounted, ref } from 'vue'

const data = ref('order-list')

setTimeout(() => {
  data.value += ' fetched'
}, 500)
</script>

<template>
  <div>
    {{ data }}
  </div>
</template>

<style lang="scss"></style>
