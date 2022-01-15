import Cmp from './index.vue'
import { createUseDrawerContainer } from '@/use'

export const useOrderListDrawer = createUseDrawerContainer({
  name: '订单列表',
  component: Cmp,
})
export default Cmp
