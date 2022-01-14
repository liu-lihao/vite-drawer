<script setup lang="ts">
import { NButton } from 'naive-ui'
import { useOrderListDrawer } from '@/views/order-list'
import { useCustomerDetailDrawer } from '@/views/customer-detail'
import { onShowByDrawer } from '@/use'

const orderListDrawer = useOrderListDrawer()

const customerDetailDrawer = useCustomerDetailDrawer()

onShowByDrawer((records) => {
  console.log('App onShowByDrawer', records)
})

</script>

<template>
  <n-button type="primary" @click="orderListDrawer.open()">
    orderListDrawer
  </n-button>
  <n-button type="primary" @click="customerDetailDrawer.open()">
    customerDetailDrawer
  </n-button>
</template>

<style>
html, body {
  min-height: 100vh;
}
</style>
