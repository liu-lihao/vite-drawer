import Cmp from './index.vue'
import { createUseDrawerContainer } from '@/use'

export const useProductDetailDrawer = createUseDrawerContainer({
  name: '产品详情',
  component: Cmp,
})
export default Cmp
