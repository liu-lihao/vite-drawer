import Cmp from './index.vue'
import { createUseDrawerContainer } from '@/use'

export const useProductDetailDrawer = createUseDrawerContainer({
  name: 'product-detail',
  component: Cmp,
})
export default Cmp
