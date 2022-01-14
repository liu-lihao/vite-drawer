<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, ref, toRefs, watch } from 'vue'
import { NBreadcrumb, NBreadcrumbItem, NButton } from 'naive-ui'

import type { DrawerItem, ShowEvents } from './types'
import { BEFORE_SHOW_EVENTS, DRAWER_ITEMS, IS_DRAWER_INNER } from './constants'
import { useProvide } from '@/use'

const props = defineProps({
  items: {
    type: Array as PropType<DrawerItem[]>,
    default: () => [],
  },
  showEvents: {
    type: Object as PropType<ShowEvents>,
  },
})

const propsRefs = toRefs(props)
useProvide(IS_DRAWER_INNER, true)
useProvide(DRAWER_ITEMS, propsRefs.items)
useProvide(BEFORE_SHOW_EVENTS, props.showEvents)

const lastItem = computed(() => props.items.slice(-1)[0] || {})

const excludeArr = ref<string[]>([])

watch(lastItem, (v) => {
  v?.registerRemoveRecord?.(() => {
    excludeArr.value.push(v?.itemCmpName)
  })
  v?.onActive?.()
})

</script>

<template>
  <div class="drawer-container shadow-2xl bg-yellow-600 fixed top-0 right-0 w-2/3 h-full">
    <n-button type="primary" @click="() => lastItem?.close?.()">
      pop
    </n-button>
    当前激活抽屉：{{ lastItem.name }}
    <n-breadcrumb class="bg-red-300 p-2 overflow-auto">
      <n-breadcrumb-item v-for="n in props.items" :key="n.uid" @click="n.toActive">
        <span
          :class="{
            'text-gray-500': !n.record,
            'text-blue-600': n.record,
          }"
        >{{ n.name }}</span>
      </n-breadcrumb-item>
    </n-breadcrumb>
    <div class="bg-green-400 pt-2">
      <keep-alive :exclude="excludeArr">
        <component :is="lastItem.component" :key="lastItem.uid" />
      </keep-alive>
    </div>
  </div>
</template>

<style lang="scss"></style>
