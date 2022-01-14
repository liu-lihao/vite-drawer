import Cmp from './index.vue'
import { createUseDrawerContainer } from '@/use'

export const useCustomerDetailDrawer = createUseDrawerContainer({
  name: 'customer-detail',
  component: Cmp,
})

export default Cmp
