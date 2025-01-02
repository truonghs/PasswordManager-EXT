import { Meta, StoryFn } from '@storybook/react'

import { AccountItem } from '@/components'
import { IAccountDataResponse } from '@/interfaces'

const meta: Meta = {
  title: 'Components/AccountItem',
  component: AccountItem,
  tags: ['autodocs'],
  argTypes: {
    setOpen: { action: 'setOpen' },
    setDeleteAccountId: { action: 'setDeleteAccountId' }
  }
}

export default meta

const mockAccount: IAccountDataResponse = {
  id: '1',
  domain: 'example.com',
  username: 'user@example.com',
  password: 'encrypted_password',
  owner: {
    id: '1',
    name: 'Gia Bao',
    email: 'giabao@gmail.com',
    roleAccess: 'MANAGE'
  },
  members: [
    {
      id: '1',
      name: 'Gia Bao1',
      email: 'giabao1@gmail.com',
      roleAccess: 'MANAGE'
    }
  ]
}

const Template: StoryFn<typeof AccountItem> = (args) => <AccountItem {...args} />

export const WithActions = Template.bind({})
WithActions.args = {
  account: mockAccount,
}

export const WithoutActions = Template.bind({})
WithoutActions.args = {
  account: mockAccount,
}
