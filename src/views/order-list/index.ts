import Cmp from './index.vue'
import { createUseDrawerContainer } from '@/use'

export const useOrderListDrawer = createUseDrawerContainer({
  name: 'order-list',
  component: Cmp,
})
export default Cmp
