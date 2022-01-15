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
  <div class="p-5">
    <div class="p-5">
      {{ data }}
    </div>
    <n-button type="primary" @click="orderDetailDrawer.open({ props: { orderId: new Date().toLocaleString() } })">
      订单详情抽屉
    </n-button>
    <n-button class="ml-5" type="primary" @click="customerDetailDrawer.open()">
      客户详情抽屉
    </n-button>
  </div>
</template>

<style lang="scss"></style>
