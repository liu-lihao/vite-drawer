export interface DrawerItem {
  uid: number
  name?: string
  originComponent: any
  component: any

  // 激活态相关
  active: boolean
  toActive: () => void
  onActive: () => void

  // keepAlive 缓存相关
  itemCmpName: string
  record: boolean
  removeRecord: () => void
  registerRemoveRecord: (fn: () => void) => void

  showEvents: ShowEvents

  close: () => void
}

export interface ShowEvents {
  records: Record<string, number>
  events: ((records: ShowEvents['records']) => void)[]
}
