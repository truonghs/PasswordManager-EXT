import { createHashRouter } from 'react-router-dom'

import {
  Account,
  Login,
  CreateAccount,
  CreateWorkspace,
  EditAccount,
  EditWorkspace,
  Generator,
  Home,
  CreateContactInfo,
  EditContactInfo,
  SharingAccount,
  SharingWorkspace,
  Notification
} from '@/pages'
import { PATH } from '@/utils/constants'
import { DefaultLayout, AuthLayout } from '@/layouts'
import { IframeModal, IframeModalContactInfo } from '@/components'

export const router = createHashRouter([
  {
    path: PATH.HOME,
    element: <DefaultLayout />,
    children: [
      {
        path: PATH.HOME,
        element: <Home />
      },
      {
        path: PATH.GENERATOR,
        element: <Generator />
      },
      {
        path: PATH.NOTIFICATION,
        element: <Notification />
      },
      {
        path: PATH.CREATE_WORKSPACE,
        element: <CreateWorkspace />
      },
      {
        path: PATH.EDIT_WORKSPACE,
        element: <EditWorkspace />
      },
      {
        path: PATH.ACCOUNT,
        element: <Account />
      }
    ]
  },
  {
    path: PATH.HOME,
    element: <AuthLayout />,
    children: [
      {
        path: PATH.LOGIN,
        element: <Login />
      }
    ]
  },
  {
    path: PATH.WEBCLIENT_INFIELD,
    element: <IframeModal />
  },
  {
    path: PATH.WEBCLIENT_INFIELD_CONTACT,
    element: <IframeModalContactInfo />
  },
  {
    path: PATH.CREATE_ACCOUNT,
    element: <CreateAccount />
  },
  {
    path: PATH.EDIT_ACCOUNT,
    element: <EditAccount />
  },
  {
    path: PATH.SHARING_ACCOUNT,
    element: <SharingAccount />
  },
  {
    path: PATH.SHARING_WORKSPACE,
    element: <SharingWorkspace />
  },
  {
    path: PATH.CREATE_CONTACTINFO,
    element: <CreateContactInfo />
  },
  {
    path: PATH.EDIT_CONTACTINFO,
    element: <EditContactInfo />
  }
])
