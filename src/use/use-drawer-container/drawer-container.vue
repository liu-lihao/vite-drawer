<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, ref, toRefs, watch } from 'vue'
import { NButton } from 'naive-ui'

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
  <div class="drawer-container bg-yellow-600">
    <n-button type="primary" @click="() => lastItem?.close?.()">
      pop
    </n-button>
    当前激活抽屉：{{ lastItem.name }}
    <div class="flex">
      <div
        v-for="n in props.items" :key="n.uid" class="p-2  " :class="{
          'text-gray-500': !n.record
        }"
        @click="n.toActive"
      >
        {{ n.name }}({{ n.uid }})
      </div>
    </div>
    <keep-alive :exclude="excludeArr">
      <component :is="lastItem.component" :key="lastItem.uid" />
    </keep-alive>
  </div>
</template>

<style lang="scss"></style>
