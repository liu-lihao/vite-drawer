import type { Ref } from 'vue'
import { defineComponent, h, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue'

import type { ContainerConfig, DrawerItem, OpenConfig, ShowEvents } from './types'
import DrawerContainer from './drawer-container.vue'
import { BASE_SHOW_EVENTS, BEFORE_SHOW_EVENTS, DRAWER_ITEMS, IS_DRAWER_INNER, ITEM_SHOW_EVENTS } from './constants'
import { createUseCreatePortal, useInject, useProvide } from '@/use'

let uid = 0
let openedPortalDestroy: any
// let acitveEvents: Record<string, Record<string, any>>

const useDrawerPortal = createUseCreatePortal(DrawerContainer)

const createShowEvents = () => {
  const obj: ShowEvents = {
    records: {},
    events: [],
    runEvents: () => {
      obj.events.forEach(n => n(obj.records))
    },
    addEvent: (cb) => {
      obj.events.push(cb)
      return () => {
        obj.events.splice(obj.events.indexOf(cb), 1)
      }
    },
    addRecords: (records) => {
      Object.assign(obj.records, records || {})
    },
    clearRecords: () => {
      for (const k in obj.records) {
        delete obj.records[k]
      }
    },
  }
  return obj
}

export const useDrawerContainer = (config: ContainerConfig) => {
  const isDrawerInner = useInject<boolean>(IS_DRAWER_INNER)
  const portal = isDrawerInner ? null : useDrawerPortal()
  const items = isDrawerInner ? useInject<Ref<DrawerItem[]>>(DRAWER_ITEMS)! : ref<DrawerItem[]>([])
  let currentItem: DrawerItem

  const baseShowEvents: ShowEvents = useInject(BASE_SHOW_EVENTS) || createShowEvents()

  if (!isDrawerInner) {
    useProvide(BASE_SHOW_EVENTS, baseShowEvents)
  }

  const createItem = (data: OpenConfig, beforeItem?: DrawerItem) => {
    const itemUid = uid++
    const itemCmpName = `DrawerItem${itemUid}`
    const showEvents = shallowRef(createShowEvents())

    const itemCmp = defineComponent({
      name: itemCmpName,
      setup() {
        useProvide(ITEM_SHOW_EVENTS, showEvents.value)
        useProvide(BEFORE_SHOW_EVENTS, beforeItem?.showEvents || baseShowEvents)
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
    }) as DrawerItem

    const getIndex = () => items.value.findIndex(n => n === item)

    const inheritItemShowEvents = (i = getIndex()) => {
      const showEvents = i ? items.value[i - 1]?.showEvents : baseShowEvents
      showEvents.addRecords(item.showEvents.records)
    }

    // 直接激活自己
    item.toActive = () => {
      while (items.value[items.value.length - 1] !== item) {
        items.value[items.value.length - 1].close()
      }
    }

    // 注册清除缓存函数
    let realRemoveRecord: any
    item.registerRemoveRecord = (fn: any) => {
      realRemoveRecord = fn
    }

    // 清除缓存
    item.removeRecord = () => {
      item.record = false
      realRemoveRecord?.()
    }

    // 被渲染
    item.onActive = () => {
      items.value.forEach(n => n.active = false)
      item.active = true
      item.record = true
      item.showEvents.runEvents()
      // 执行完 onShow 后，将记录的 records 直接继承到下一层，并清空当前层级记录到 records
      inheritItemShowEvents()
      item.showEvents.clearRecords()
    }

    // 关闭到统一入口
    item.close = () => {
      const i = getIndex()
      // 减少冗余缓存
      item.removeRecord()
      inheritItemShowEvents(i)
      items.value.splice(i, 1)
    }

    return item as DrawerItem
  }

  const open = (data: OpenConfig = {}) => {
    if (!isDrawerInner) {
      // 底层容器调用 open 时，不触发底层容器的 onShow、清除 showRecords
      openedPortalDestroy?.(false)
      openedPortalDestroy = (triggerShow = true) => {
        openedPortalDestroy = null
        while (items.value.length) {
          items.value[items.value.length - 1].close()
        }
        portal?.destroy?.()
        triggerShow && baseShowEvents.runEvents()
        triggerShow && baseShowEvents.clearRecords()
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
      // 底层重复open的覆盖场景下，不能等到
      flush: 'sync',
    })
  }

  return {
    open,
    close,
  }
}

export const createUseDrawerContainer = (config: ContainerConfig) => () => useDrawerContainer(config)

export const useIsDrawerInner = () => ({ isDrawerInner: useInject<boolean>(IS_DRAWER_INNER) })

export const onShowByDrawer = (cb: ShowEvents['events']['0']) => {
  const showEvents = useInject<ShowEvents>(ITEM_SHOW_EVENTS) || useInject<ShowEvents>(BASE_SHOW_EVENTS)
  if (!showEvents) {
    throw new Error('useDrawerContainer 必须在 onShowByDrawer 之前调用')
  }
  const removeCb = showEvents.addEvent(cb)
  onBeforeUnmount(() => removeCb())
}

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
