<script setup lang="ts">
import { ref } from 'vue'
import { NButton } from 'naive-ui'
import { useOrderDetailDrawer } from '@/views/order-detail'
import { useRecordShowEvents } from '@/use'

const orderDetailDrawer = useOrderDetailDrawer()

const { recordShowEvents } = useRecordShowEvents()

const data = ref('customer-detail')

setTimeout(() => {
  data.value += ' fetched'
}, 500)
</script>

<template>
  <div>
    {{ data }}
  </div>
  <n-button type="primary" @click="orderDetailDrawer.open({ props: { orderId: new Date().toLocaleString() } })">
    orderDetailDrawer
  </n-button>
  <n-button type="primary" @click="() => recordShowEvents('product-list')">
    Change Product List
  </n-button>
</template>

<style lang="scss"></style>
