import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'

const { Content } = Layout

export const AuthLayout = () => {
  return (
    <Layout className='w-[375px] lg:w-auto max-w-full overflow-hidden'>
      <Content className='min-h-[120px]'>
        <Outlet />
      </Content>
    </Layout>
  )
}
