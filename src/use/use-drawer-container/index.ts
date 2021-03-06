import type { Ref } from 'vue'
import { defineComponent, h, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue'

import type { ContainerConfig, DrawerItem, OpenConfig, ShowEvents } from './types'
import DrawerContainer from './drawer-container.vue'
import { BASE_SHOW_EVENTS, BEFORE_SHOW_EVENTS, DRAWER_ITEMS, IS_DRAWER_INNER, ITEM_SHOW_EVENTS } from './constants'
import { createUseCreatePortal, useInject, useProvide } from '@/use'

let uid = 0
let openedPortalDestroy: any

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
        const i = obj.events.indexOf(cb)
        i !== -1 && obj.events.splice(i, 1)
      }
    },
    addRecords: (records) => {
      records = { ...records }
      for (const key in records) {
        if (key in obj.records) {
          obj.records[key] += records[key]
          delete records[key]
        }
      }
      Object.assign(obj.records, records)
    },
    clearRecords: () => {
      for (const k in obj.records) {
        delete obj.records[k]
      }
    },
  }
  return obj
}

const createItem = ({
  data,
  items,
  config,
  beforeItem,
  baseShowEvents,
  onClose,
}: {
  data: OpenConfig
  items: Ref<DrawerItem[]>
  config: ContainerConfig
  beforeItem?: DrawerItem
  baseShowEvents?: ShowEvents | null
  onClose: () => void
}) => {
  const itemUid = uid++
  const cacheName = `DrawerItem${itemUid}`
  const showEvents = shallowRef(createShowEvents())

  const itemCmp = defineComponent({
    name: cacheName,
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

    // ???????????????
    active: true,
    toActive: null,
    onActive: null,

    // keepAlive ????????????
    cacheName,
    cache: true,
    removeCache: null,
    registerRemoveCache: null,

    showEvents,

    close: null,
  }) as DrawerItem

  const getIndex = () => items.value.findIndex(n => n === item)

  const inheritItemShowEvents = (i = getIndex()) => {
    const showEvents = i ? items.value[i - 1]?.showEvents : baseShowEvents
    showEvents?.addRecords(item.showEvents.records)
  }

  // ??????????????????
  item.toActive = () => {
    while (items.value[items.value.length - 1] !== item) {
      items.value[items.value.length - 1].close()
    }
  }

  // ????????????????????????
  let realRemoveRecord: any
  item.registerRemoveCache = (fn: any) => {
    realRemoveRecord = fn
  }

  // ????????????
  item.removeCache = () => {
    item.cache = false
    realRemoveRecord?.()
  }

  // ?????????
  item.onActive = () => {
    items.value.forEach(n => n.active = false)
    item.cache = true
    item.active = true
    item.showEvents.runEvents()
    // ????????? onShow ?????????????????? records ????????????????????????????????????????????????????????? records
    inheritItemShowEvents()
    item.showEvents.clearRecords()
  }

  // ?????????????????????
  item.close = () => {
    const i = getIndex()
    // ??????????????????
    item.removeCache()
    inheritItemShowEvents(i)
    items.value.splice(i, 1)
    onClose()
  }

  return item as DrawerItem
}

export const useDrawerContainer = (config: ContainerConfig) => {
  const isDrawerInner = useInject<boolean>(IS_DRAWER_INNER)

  const portal = isDrawerInner ? null : useDrawerPortal()
  const items = isDrawerInner ? useInject<Ref<DrawerItem[]>>(DRAWER_ITEMS)! : ref<DrawerItem[]>([])
  const baseShowEvents: ShowEvents | null = isDrawerInner ? null : (useInject(BASE_SHOW_EVENTS) || createShowEvents())

  let currentItem: DrawerItem | null

  if (!isDrawerInner) {
    useProvide(BASE_SHOW_EVENTS, baseShowEvents)
  }

  const open = (data: OpenConfig = {}) => {
    // ?????????????????????????????? open???????????????????????? open
    if (!isDrawerInner) {
      // ??????????????????
      // ???????????????????????? open ?????????????????????????????? onShow????????? showRecords
      openedPortalDestroy?.(false)
      openedPortalDestroy = (triggerShow = true) => {
        currentItem = null
        openedPortalDestroy = null
        while (items.value.length) {
          items.value[items.value.length - 1].close()
        }
        portal?.destroy?.()
        if (triggerShow) {
          baseShowEvents?.runEvents()
          baseShowEvents?.clearRecords()
        }
      }
    }
    else {
      // ???????????????????????????
      currentItem?.close?.()
    }

    items.value.forEach((n) => {
      n.originComponent === config.component && n.removeCache()
    })

    currentItem = createItem({
      data,
      items,
      config,
      beforeItem: items.value[items.value.length - 1],
      baseShowEvents,
      onClose() {
        currentItem = null
      },
    })

    items.value.push(currentItem)

    if (!isDrawerInner) {
      portal?.create?.({
        items: items.value,
        showEvents: currentItem.showEvents,
      })
    }
  }

  const close = () => {
    if (isDrawerInner) {
      currentItem?.close?.()
    }
    else {
      openedPortalDestroy?.()
    }
  }

  if (!isDrawerInner) {
    watch(() => items.value.length, () => {
      if (items.value.length === 0) {
        openedPortalDestroy?.()
      }
    }, {
      // ????????????open??????????????????????????? items??????????????? push ????????????
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

export const onShowByDrawer = (cb: ShowEvents['events'][0]) => {
  const showEvents = useInject<ShowEvents>(ITEM_SHOW_EVENTS) || useInject<ShowEvents>(BASE_SHOW_EVENTS)
  if (!showEvents) {
    throw new Error('onShowByDrawer ????????? useDrawerContainer ????????????')
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
      showEvents.records[key] = +1
    },
  }
}
