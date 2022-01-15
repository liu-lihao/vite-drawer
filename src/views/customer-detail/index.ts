import Cmp from './index.vue'
import { createUseDrawerContainer } from '@/use'

export const useCustomerDetailDrawer = createUseDrawerContainer({
  name: '客户详情',
  component: Cmp,
})

export default Cmp
