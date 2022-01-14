import type { WatchSource } from 'vue'
import { computed } from 'vue'
import { isFunction } from 'lodash'
import { useEmit } from '@/use'

export const useModel = <T>(
  propsValue: WatchSource<T>,
  action = 'update:modelValue' as string | string[],
) => {
  const emit = useEmit()
  const actions = ([] as string[]).concat(action)
  const localValue = computed<T>({
    get() {
      if (isFunction(propsValue)) { return propsValue() }

      return propsValue.value
    },
    set(v) {
      actions.forEach(a => emit(a, v))
    },
  })

  return [localValue]
}
