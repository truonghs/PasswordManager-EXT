import { MemoryRouter } from 'react-router-dom'
import { Meta, StoryFn } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { WorkspaceItem } from '@/components'
import { ROLE_ACCESS } from '@/utils/constants'
import { IWorkspaceDataResponse } from '@/interfaces'

const meta: Meta = {
  title: 'Components/WorkspaceItem',
  component: WorkspaceItem,
  tags: ['autodocs'],
  argTypes: {
    setAccessWorkspace: { action: 'setAccessWorkspace' },
    setDeleteWorkspaceId: { action: 'setDeleteWorkspaceId' },
    setOpen: { action: 'setOpen' }
  }
}

export default meta

const queryClient = new QueryClient()

const mockWorkspace: IWorkspaceDataResponse = {
  id: '1',
  owner: {
    id: '1',
    name: 'Owner',
    email: 'owner@gmail.com',
    roleAccess: ROLE_ACCESS.MANAGE
  },
  name: 'Demo Workspace',
  accounts: [
    {
      id: '1',
      username: 'Account 1',
      password: '12345678',
      domain: 'example.domain.com',
      owner: {
        id: '1',
        name: 'Owner',
        email: 'owner@gmail.com',
        roleAccess: ROLE_ACCESS.MANAGE
      },
      members: []
    }
  ],
  members: []
}

const Template: StoryFn<typeof WorkspaceItem> = (args) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter>
      <WorkspaceItem {...args} />
    </MemoryRouter>
  </QueryClientProvider>
)

export const WithActions = Template.bind({})
WithActions.args = {
  workspace: mockWorkspace,
  setDeleteWorkspaceId: action('setDeleteWorkspaceId'),
  setOpen: action('setOpen')
}

export const WithoutActions = Template.bind({})
WithoutActions.args = {
  workspace: mockWorkspace,
  setDeleteWorkspaceId: action('setDeleteWorkspaceId'),
  setOpen: action('setOpen')
}
