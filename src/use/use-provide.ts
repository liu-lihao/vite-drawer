import type {
  ComponentInternalInstance,
  InjectionKey,
} from 'vue'
import {
  getCurrentInstance,
  inject,
  onBeforeUnmount,
  provide,
} from 'vue'

/**
 * {
 *    [vm] : {
 *      [InjectionKey] : [value]
 *    }
 * }
 */
type Vm = ComponentInternalInstance | null
type ProvideContextMap = Map<InjectionKey<any> | string | number, any>

const store = new Map<Vm, ProvideContextMap>()

export const useProvide = <T>(
  key: InjectionKey<T> | string | number,
  value: T,
) => {
  const vm = getCurrentInstance()
  if (!store.get(vm)) { store.set(vm, new Map()) }

  store.get(vm)!.set(key, value)
  provide(key, value)

  onBeforeUnmount(() => {
    store.delete(vm)
  })
}

export const useInject = <T>(key: InjectionKey<T> | string) => {
  const vm = getCurrentInstance()
  const vmContextMap = store.get(vm)
  if (vmContextMap && vmContextMap.has(key)) { return vmContextMap.get(key) as T }

  return inject(key)
}
