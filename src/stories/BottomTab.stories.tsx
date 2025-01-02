import { MemoryRouter } from 'react-router-dom'
import { BottomTab } from '@/components'

export default {
  title: 'Components/BottomTab',
  component: BottomTab
}

export const Default = () => (
  <MemoryRouter>
    <BottomTab />
  </MemoryRouter>
)
