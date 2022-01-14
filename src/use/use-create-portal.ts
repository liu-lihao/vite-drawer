import { isFunction } from 'lodash'
import type {
  Component,
  Ref,
} from 'vue'
import {
  defineComponent,
  getCurrentInstance,
  h,
  onBeforeUnmount,
  render,
  shallowRef,
  unref,
} from 'vue'

type ComponentProps = Record<string, any>
type Container = Ref<Element | null> | Element | null | (() => Element | null)

const getContainer = (c?: Container) => (isFunction(c) ? c() : unref(c))

interface Options {
  children: any
  container: Container
  autoDestroy: boolean
  visibleKey: string
  onVisibleChangeKey: string
}

/**
 * 弹窗创建
 *
 * 强烈建议您为弹窗组件本身实现：`v-model:visible` ，弹窗内外通过双向绑定，控制弹窗显示/隐藏。
 *
 * 否则，通过 `mount` 复用弹窗组件时，可能导致 **中间层的弹窗容器** 传入弹窗的部分 props 未发生变化的问题。
 *
 * 如果您很清楚 `v-model:visible` 的原理，则可以修改 `visibleKey/onVisibleChangeKey` 来兼容其他弹窗
 *
 * （当然了，你也可以手动传入 `onXX` 来调用 `update` 实现更高阶的兼容 ）
 */
export const useCreatePortal = <T extends ComponentProps>(
  component: Component,
  options: Partial<Options> = {},
) => {
  const {
    children,
    container,
    visibleKey = 'visible',
    onVisibleChangeKey = `onUpdate:${visibleKey}`,
    autoDestroy = true,
  } = options
  const parentVm = getCurrentInstance()
  const state = shallowRef<Partial<T>>({})
  const update = (data?: Partial<T>) => {
    state.value = data ? { ...state.value, ...data } : state.value
  }
  const onUpdateVisible = (flag: unknown) =>
    update({ [visibleKey]: flag } as any)

  let hasCreated = false
  let unmount: Function | null

  const createVm = () => {
    const div = document.createElement('div')

    ;(getContainer(container) || document.body).appendChild(div)

    const portalCmp = defineComponent({
      name: 'PortalContainer',
      parent: parentVm?.proxy,
      render() {
        return h(
          component,
          {
            [onVisibleChangeKey]: onUpdateVisible,
            ...state.value,
          },
          children,
        )
      },
    })

    // inherit app context
    // ex: app.components/app.provides/app.config.globalProperties
    // https://github.com/vuejs/vue-next/issues/2097#issuecomment-707975628
    const cmp = h(portalCmp)

    if (parentVm?.appContext) { cmp.appContext = parentVm?.appContext }

    render(cmp, div)

    hasCreated = true

    unmount = () => {
      // packages\runtime-core\src\apiCreateApp.ts
      // packages\runtime-core\src\renderer.ts
      // 参考 app.unmount
      // 如果 render 第一个参数传入 null, 则会 unmount(div._vnode)
      render(null, div)
      div.parentNode?.removeChild?.(div)
      hasCreated = false
      state.value = {}
      unmount = null
    }
  }

  const destroy = () => unmount?.()

  const mount = (data?: Partial<T>) => {
    update(data)
    !hasCreated && createVm()
  }

  const create = (data?: Partial<T>) => {
    destroy()
    mount(data)
  }

  autoDestroy && onBeforeUnmount(() => destroy())

  return {
    mount,
    update,
    create,
    destroy,
  }
}

export const createUseCreatePortal = <T extends ComponentProps>(
  component: Component,
  options = {} as Partial<Options>,
) => {
  return () => useCreatePortal<T>(component, options)
}
