<script setup lang="ts">
import { ref } from 'vue'
import { NButton, NCard } from 'naive-ui'
import ProductList from './components/product-list.vue'

const data = ref('order-detail')

const props = defineProps({
  orderId: String,
})

setTimeout(() => {
  data.value += ' fetched'
}, 500)

const showProductList = ref(false)
</script>

<template>
  <div>
    {{ data }}
    <div class="p-10">
      <n-button type="primary" @click="() =>showProductList = !showProductList">
        Show Product List
      </n-button>
      {{ props.orderId }}
      <n-card v-if="showProductList" title="产品列表">
        <ProductList />
      </n-card>
    </div>
  </div>
</template>

<style lang="scss"></style>
