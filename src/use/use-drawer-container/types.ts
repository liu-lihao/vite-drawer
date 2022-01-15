export interface ShowEvents {
  records: Record<string, number>
  events: ((records: ShowEvents['records']) => void)[]
  addEvent: (cb: ShowEvents['events'][0]) => () => void
  runEvents: () => void
  addRecords: (records: Record<string, number>) => void
  clearRecords: () => void
}

export interface OpenConfig {
  name?: string
  props?: Record<string, any>
}

export interface ContainerConfig {
  name?: string
  component: any
}

export interface DrawerItem {
  uid: number
  name?: string
  component: any
  originComponent: any

  // 激活态相关
  active: boolean
  toActive: () => void
  onActive: () => void

  // keepAlive 缓存相关
  cache: boolean
  cacheName: string
  removeCache: () => void
  registerRemoveCache: (fn: () => void) => void

  showEvents: ShowEvents

  close: () => void
}
