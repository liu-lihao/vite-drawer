<script setup lang="ts">
import { ref } from 'vue'
import { NButton } from 'naive-ui'
import { useProductDetailDrawer } from '@/views/product-detail'
import { onShowByDrawer } from '@/use'

const productDetailDrawer = useProductDetailDrawer()

const data = ref('product-list')

setTimeout(() => {
  data.value += ' fetched'
}, 500)

onShowByDrawer((records) => {
  if (records['product-list']) {
    setTimeout(() => {
      data.value += ' fetched'
    }, 500)
  }
  console.log('product-list onShowByDrawer', records)
})
</script>

<template>
  {{ data }}
  <n-button type="primary" @click="productDetailDrawer.open()">
    产品详情抽屉
  </n-button>
</template>

<style lang="scss"></style>
