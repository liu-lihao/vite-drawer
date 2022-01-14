import type { Ref } from 'vue'
import { ref, watch } from 'vue'

interface ConfigType {
  minDuration: number
  delay: number
  default: boolean
  proxy: Ref<boolean> | null
  immediate: boolean
}

/**
 * 平滑的过度 loading
 */
export const useLoading = (
  config: Partial<ConfigType> = {},
): [Ref<boolean>, (v: boolean) => void] => {
  const realConfig = Object.assign(
    {
      minDuration: 800,
      delay: 200,
      default: false,
      proxy: null,
      immediate: true,
    },
    config || {},
  ) as ConfigType
  const loading = ref(realConfig.default)

  let trueTime = 0
  let trueTask: any = 0
  let falseTask: any = 0

  const setLoading = (newLoading: boolean) => {
    if (newLoading) {
      clearTimeout(falseTask)
      falseTask = 0
      if (!trueTask) {
        trueTime = Date.now() + realConfig.delay
        trueTask = setTimeout(() => {
          loading.value = true
          trueTask = 0
        }, realConfig.delay)
      }
    }
    else {
      clearTimeout(trueTask)
      trueTask = 0
      if (!falseTask) {
        const realDelay = Math.max(
          realConfig.minDuration - (Date.now() - trueTime),
          0,
        )
        falseTask = setTimeout(() => {
          loading.value = false
          falseTask = 0
        }, realDelay)
      }
    }
  }

  if (realConfig.proxy) {
    watch(realConfig.proxy!, v => setLoading(v), {
      immediate: realConfig.immediate,
    })
  }

  return [loading, setLoading]
}
