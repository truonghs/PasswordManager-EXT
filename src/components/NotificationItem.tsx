import dayjs from 'dayjs'
import { Space } from 'antd'
import { AxiosError } from 'axios'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { notificationKeys } from '@/keys'
import anonAvatar from '@/assets/images/anonAvatar.png'
import { ENVIRONMENT_KEYS, STATUS_INVITATION } from '@/utils/constants'
import { IDataResponse, IErrorResponse, INotificationDataResponse } from '@/interfaces'
import { accountSharingInvitationApi, notificationApi, workspaceSharingInvitationApi } from '@/apis'

import { CustomBtn } from './CustomBtn'

dayjs.extend(relativeTime)

type NotificationItemProps = {
  notification: INotificationDataResponse
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const queryClient = useQueryClient()

  const relativeDate = dayjs(notification.createdAt).fromNow()

  const notificationMessageMap: Record<string, (notification: NotificationItemProps['notification']) => JSX.Element> = {
    SHARE_AN_ACCOUNT: ({ sender, notificationDetail }) => {
      const accountName = notificationDetail.accountSharingInvitation?.account.username
      return (
        <span>
          <strong>{sender.name}</strong> invited you to use the account: <strong>{accountName}</strong>
        </span>
      )
    },
    MEMBER_SHARE_AN_ACCOUNT: ({ sender, notificationDetail }) => {
      const accountName = notificationDetail.memberActivityLog?.account.username
      return (
        <span>
          <strong>{sender.name}</strong> share the account: <strong>{accountName}</strong>
        </span>
      )
    },
    MEMBER_SHARE_A_WORKSPACE: ({ sender, notificationDetail }) => {
      const workspaceName = notificationDetail.memberActivityLog?.workspace?.name
      return (
        <span>
          <strong>{sender.name}</strong> share the workspace: <strong>{workspaceName}</strong>
        </span>
      )
    },
    INVITATION_TO_WORKSPACE: ({ sender, notificationDetail }) => {
      const workspaceName = notificationDetail.workspaceSharingInvitation?.workspace?.name
      return (
        <span>
          <strong>{sender.name}</strong> invited you to join the workspace: <strong>{workspaceName}</strong>
        </span>
      )
    },
    UPDATE_AN_ACCOUNT: ({ sender, notificationDetail }) => {
      const accountUsername = notificationDetail.memberActivityLog?.account.username
      const workspaceName = notificationDetail.memberActivityLog?.workspace?.name
      return (
        <>
          <strong>{sender.name}</strong> updated the account: <strong>{accountUsername}</strong>
          {workspaceName && (
            <>
              in workspace: <strong>{workspaceName}</strong>
            </>
          )}
        </>
      )
    },
    UPDATE_AN_WORKSPACE: ({ sender, notificationDetail }) => {
      const workspaceName = notificationDetail.memberActivityLog?.workspace?.name
      return (
        <>
          <strong>{sender.name}</strong> updated the workspace: <strong>{workspaceName}</strong>
        </>
      )
    }
  }

  const showButtons =
    (notification.activityType === 'SHARE_AN_ACCOUNT' || notification.activityType === 'INVITATION_TO_WORKSPACE') &&
    !notification.isRead

  const renderMessage = () => {
    const messageRenderer = notificationMessageMap[notification.activityType]
    return messageRenderer ? messageRenderer(notification) : <strong>Unknown notification type</strong>
  }

  const { mutate: mutateSetReadNotification } = useMutation<IDataResponse, AxiosError<IErrorResponse>, string>({
    mutationFn: notificationApi.setReadNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(notificationKeys.list())
    }
  })

  const { mutate: mutateDeclineAccountInvitation, isPending: isPendingDeclineAccountInvitation } = useMutation<
    IDataResponse,
    AxiosError<IErrorResponse>,
    string
  >({
    mutationFn: accountSharingInvitationApi.decline,
    onSuccess: () => {
      if (notification.id) {
        mutateSetReadNotification(notification.id)
      }
    }
  })

  const { mutate: mutateDeclineWorkspaceInvitation, isPending: isPendingDeclineWorkspaceInvitation } = useMutation<
    IDataResponse,
    AxiosError<IErrorResponse>,
    string
  >({
    mutationFn: workspaceSharingInvitationApi.decline,
    onSuccess: () => {
      if (notification.id) {
        mutateSetReadNotification(notification.id)
      }
    }
  })

  const handleAcceptInvitation = () => {
    switch (notification.activityType) {
      case 'SHARE_AN_ACCOUNT': {
        const confirmUrl = `${ENVIRONMENT_KEYS.VITE_CLIENT_URL}/confirm-account-invitation/${notification.notificationDetail.accountSharingInvitation?.id}?notificationId=${notification.id}`
        window.open(confirmUrl)
        break
      }
      case 'INVITATION_TO_WORKSPACE': {
        const confirmUrl = `${ENVIRONMENT_KEYS.VITE_CLIENT_URL}/confirm-workspace-invitation/${notification.notificationDetail.workspaceSharingInvitation?.id}?notificationId=${notification.id}`
        window.open(confirmUrl)
        break
      }
      default:
        break
    }
  }

  const handleDeclineInvitation = () => {
    switch (notification.activityType) {
      case 'SHARE_AN_ACCOUNT': {
        const invitationId = notification.notificationDetail.accountSharingInvitation?.id
        if (invitationId) mutateDeclineAccountInvitation(invitationId)
        break
      }
      case 'INVITATION_TO_WORKSPACE': {
        const invitationId = notification.notificationDetail.workspaceSharingInvitation?.id
        if (invitationId) mutateDeclineWorkspaceInvitation(invitationId)
        break
      }
      default:
        break
    }
  }

  const handleReadNotification = () => {
    if (
      notification.isRead ||
      notification.activityType === 'SHARE_AN_ACCOUNT' ||
      notification.activityType === 'INVITATION_TO_WORKSPACE'
    )
      return
    mutateSetReadNotification(notification.id)
  }

  return (
    <li
      className='flex flex-col justify-start p-4 border-b border-b-slate-200 hover:bg-gray-100'
      onClick={handleReadNotification}
    >
      <div className='flex gap-2'>
        <div className='w-10 h-10'>
          <img
            className='rounded-full w-full h-full'
            src={notification.sender?.avatar || anonAvatar}
            alt='user-avatar'
          />
        </div>
        <div className='flex flex-col flex-1 text-slate-800 text-[15px]'>
          <div className='flex justify-between items-center'>
            <span className='text-left'>{renderMessage()}</span>
            {!notification.isRead && <span className='p-1 bg-blue-500 rounded-full ml-1'></span>}
          </div>
          <span className='text-[13px] text-slate-500 text-left'>{relativeDate}</span>
          {showButtons && (
            <Space className='gap-2 mt-1'>
              <CustomBtn
                title='Decline'
                className='!text-sm !h-8 !text-slate-800 !border-slate-500 !mt-0'
                onClick={handleDeclineInvitation}
                disabled={isPendingDeclineAccountInvitation || isPendingDeclineWorkspaceInvitation}
              />
              <CustomBtn
                title='Accept'
                type='primary'
                className='!text-sm !h-8 !mt-0'
                onClick={handleAcceptInvitation}
              />
            </Space>
          )}
          {(notification.notificationDetail.accountSharingInvitation?.status === STATUS_INVITATION.ACCEPTED ||
            notification.notificationDetail.workspaceSharingInvitation?.status === STATUS_INVITATION.ACCEPTED) && (
            <span className='text-[15px] text-slate-800 text-left mt-1'>You have accepted this invitation.</span>
          )}
          {(notification.notificationDetail.accountSharingInvitation?.status === STATUS_INVITATION.DECLINE ||
            notification.notificationDetail.workspaceSharingInvitation?.status === STATUS_INVITATION.DECLINE) && (
            <span className='text-[15px] text-slate-800 text-left mt-1'>You have declined this invitation.</span>
          )}
        </div>
      </div>
    </li>
  )
}
