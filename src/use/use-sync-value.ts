import { cloneDeep, isEqual, isFunction } from 'lodash'
import type { Ref, WatchSource } from 'vue'
import { nextTick, ref, watch } from 'vue'
import { useEmit } from '@/use'

export const useSyncValue = <T>(
  propsValue: WatchSource<T>,
  action = 'update:modelValue' as string | string[],
): [Ref<T>, (v: T) => void] => {
  const emit = useEmit()
  const actions = ([] as string[]).concat(action)
  const getSourceValue = () =>
    isFunction(propsValue) ? propsValue() : propsValue.value
  const localValue = ref(cloneDeep(getSourceValue())) as Ref<T>
  // 记录理论外部 props
  // 避免外部未传入时，props一直不变的情况下，当 localValue 变化未 props 一样时，不触发事件的问题。
  let theoryProps = getSourceValue()

  let uid = 0
  let propsChanged = false

  watch(
    propsValue,
    () => {
      theoryProps = getSourceValue()
      const recordUid = ++uid
      nextTick(() => {
        if (recordUid === uid && !isEqual(getSourceValue(), localValue.value)) {
          localValue.value = cloneDeep(getSourceValue())
          propsChanged = true
        }
      })
    },
    { deep: true },
  )

  watch(
    localValue,
    () => {
      if (propsChanged) { return (propsChanged = false) }

      if (!isEqual(theoryProps, localValue.value)) {
        const emitValue = cloneDeep(localValue.value)
        actions.forEach(a => emit(a, emitValue))
        theoryProps = emitValue
      }
    },
    { deep: true },
  )

  const setValue = (value: T) => {
    localValue.value = value === getSourceValue() ? cloneDeep(value) : value
  }

  return [localValue, setValue]
}
