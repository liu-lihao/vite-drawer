import Cmp from './index.vue'
import { createUseDrawerContainer } from '@/use'

export const useOrderDetailDrawer = createUseDrawerContainer({
  name: '订单详情',
  component: Cmp,
})
export default Cmp
