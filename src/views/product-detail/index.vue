<script setup lang="ts">
import { ref } from 'vue'
import { NButton } from 'naive-ui'
import { useOrderDetailDrawer } from '@/views/order-detail'
import { useCustomerDetailDrawer } from '@/views/customer-detail'

const orderDetailDrawer = useOrderDetailDrawer()

const customerDetailDrawer = useCustomerDetailDrawer()

const data = ref('product-detail')

setTimeout(() => {
  data.value += ' fetched'
}, 500)
</script>

<template>
  {{ data }}
  <n-button type="primary" @click="orderDetailDrawer.open({ props: { orderId: new Date().toLocaleString() } })">
    orderDetailDrawer
  </n-button>
  <n-button type="primary" @click="customerDetailDrawer.open()">
    customerDetailDrawer
  </n-button>
</template>

<style lang="scss"></style>
