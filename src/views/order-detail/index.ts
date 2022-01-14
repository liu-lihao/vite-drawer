import Cmp from './index.vue'
import { createUseDrawerContainer } from '@/use'

export const useOrderDetailDrawer = createUseDrawerContainer({
  name: 'order-detail',
  component: Cmp,
})
export default Cmp
