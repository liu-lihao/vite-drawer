import type { Ref } from 'vue'
import { defineComponent, h, nextTick, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue'

import type { DrawerItem, ShowEvents } from './types'
import DrawerContainer from './drawer-container.vue'
import { BASE_SHOW_EVENTS, BEFORE_SHOW_EVENTS, DRAWER_ITEMS, IS_DRAWER_INNER, ITEM_SHOW_EVENTS } from './constants'
import { createUseCreatePortal, useInject, useProvide } from '@/use'

let uid = 0
let openedPortalDestroy: any
// let acitveEvents: Record<string, Record<string, any>>

const useDrawerPortal = createUseCreatePortal(DrawerContainer)

export const useDrawerContainer = (config: {
  name?: string
  component: any
}) => {
  const isDrawerInner = useInject<boolean>(IS_DRAWER_INNER)
  const portal = isDrawerInner ? null : useDrawerPortal()
  const items = isDrawerInner ? useInject<Ref<DrawerItem[]>>(DRAWER_ITEMS)! : ref<DrawerItem[]>([])
  let currentItem: DrawerItem

  // const isFirstBase = !useInject(BASE_SHOW_EVENTS)
  const showEvents: ShowEvents = useInject(BASE_SHOW_EVENTS) || { records: {}, events: [] }

  if (!isDrawerInner) {
    useProvide(BASE_SHOW_EVENTS, showEvents)
  }

  const createItem = (data: {
    name?: string
    props?: Record<string, any>
  }, beforeItem: DrawerItem) => {
    const itemUid = uid++
    const itemCmpName = `DrawerItem-${itemUid}`
    const showEvents = shallowRef({
      records: {},
      events: [],
    })

    const itemCmp = defineComponent({
      name: itemCmpName,
      setup() {
        useProvide(ITEM_SHOW_EVENTS, showEvents.value)
        useProvide(BEFORE_SHOW_EVENTS, beforeItem?.showEvents)
      },
      render() {
        return h(
          config.component,
          {
            ...data.props,
          },
        )
      },
    })

    const item = reactive<Record<keyof DrawerItem, any>>({
      uid: itemUid,
      name: data.name ?? config.name,
      originComponent: shallowRef(config.component),
      component: shallowRef(itemCmp),

      // 激活态相关
      active: true,
      toActive: null,
      onActive: null,

      // keepAlive 缓存相关
      itemCmpName,
      record: true,
      removeRecord: null,
      registerRemoveRecord: null,

      showEvents,

      close: null,
    })
    item.toActive = () => {
      while (items.value[items.value.length - 1] !== item) {
        items.value[items.value.length - 1].close()
      }
    }
    let realRemoveRecord: any
    item.registerRemoveRecord = (fn: any) => {
      realRemoveRecord = fn
    }
    item.removeRecord = () => {
      item.record = false
      realRemoveRecord?.()
    }
    item.onActive = () => {
      items.value.forEach(n => n.active = false)
      item.active = true
      item.record = true
      item.showEvents?.events?.forEach?.((cb: any) => {
        cb(item.showEvents.records)
      })
    }
    item.close = () => {
      // 减少冗余缓存
      item.removeRecord()
      const i = items.value.findIndex(n => n === item)
      items.value.splice(i, 1)
      if (i) {
        Object.assign(items.value[i - 1].showEvents.records, item.showEvents.records)
      }
      else {
        Object.assign(showEvents.value.records, item.showEvents.records)
      }
    }

    return item as DrawerItem
  }

  const open = (data: {
    name?: string
    props?: Record<string, any>
  } = {}) => {
    if (!isDrawerInner) {
      // 底层容器调用 open 时，不触发底层容器的 onShow
      openedPortalDestroy?.(false)
      openedPortalDestroy = (triggerShow = true) => {
        openedPortalDestroy = null
        while (items.value.length) {
          items.value[items.value.length - 1].close()
        }
        portal?.destroy?.()
        triggerShow && showEvents.events.forEach(cb => cb(showEvents.records))
      }
    }
    items.value.forEach((n) => {
      n.originComponent === config.component && n.removeRecord()
    })
    currentItem = createItem(data, items.value[items.value.length - 1])
    items.value.push(currentItem)
    if (!isDrawerInner) {
      portal?.create?.({
        items: items.value,
        showEvents: currentItem.showEvents,
      })
    }
  }

  // TODO 记录 open，一次性关闭
  const close = () => {
    currentItem?.close?.()
  }

  if (!isDrawerInner) {
    watch(() => items.value.length, () => {
      if (items.value.length === 0) {
        openedPortalDestroy?.()
      }
    }, {
      flush: 'sync',
    })
  }

  return {
    open,
    close,
  }
}

export const createUseDrawerContainer = (config: {
  name?: string
  component: any
}) => () => useDrawerContainer(config)

export const onShowByDrawer = (cb: ShowEvents['events']['0']) => {
  const showEvents = useInject<ShowEvents>(ITEM_SHOW_EVENTS) || useInject<ShowEvents>(BASE_SHOW_EVENTS)
  if (!showEvents) {
    throw new Error('useDrawerContainer 必须在 onShowByDrawer 之前调用')
  }
  showEvents.events.push(cb)
  onBeforeUnmount(() => {
    const i = showEvents.events.findIndex(n => n === cb)
    showEvents.events.splice(i, 1)
  })
}

export const useIsDrawerInner = () => ({ isDrawerInner: useInject<boolean>(IS_DRAWER_INNER) })
export const useRecordShowEvents = () => {
  const showEvents = useInject<ShowEvents>(BEFORE_SHOW_EVENTS)
  return {
    recordShowEvents: (key: string) => {
      if (!showEvents) return
      if (!showEvents.records) showEvents.records = {}
      if (!showEvents.records[key]) showEvents.records[key] = 0
      showEvents.records[key] += 1
    },
  }
}
