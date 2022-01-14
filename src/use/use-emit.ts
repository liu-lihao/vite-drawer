import type { ComponentInternalInstance } from 'vue'
import { getCurrentInstance } from 'vue'

export const useEmit = () => {
  const vm = getCurrentInstance()
  return vm?.emit as ComponentInternalInstance['emit']
}
