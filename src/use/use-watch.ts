import { merge, omit } from 'lodash'
import type { Ref } from 'vue'
import { watch } from 'vue'

interface Options {
  immediate?: boolean
  deep?: boolean
  watching?: boolean
}

export const useWatch = <T>(
  source: Ref<T> | (() => T),
  callback: (v: T, ov: T) => void,
  options?: Options,
) => {
  let realOptions = omit(options, 'watching')

  let stopWatch: null | Function = null

  const watching = (options?: Options) => {
    realOptions = options ? merge(realOptions, options) : realOptions
    stopWatch?.()
    stopWatch = watch(source, callback as any, realOptions)
  }

  const pause = () => stopWatch?.()

  if (options?.watching ?? true) watching()

  return { watching, pause }
}
