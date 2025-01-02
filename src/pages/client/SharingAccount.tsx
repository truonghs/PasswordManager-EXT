import { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Spin, message, notification } from 'antd'
import { useMutation, useQuery } from '@tanstack/react-query'

import { accountKeys } from '@/keys'
import { icons } from '@/utils/icons'
import { ROLE_ACCESS, VALIDATION_REGEX } from '@/utils/constants'
import { CardSharingMember, CustomBtn, CustomInput } from '@/components'
import { accountSharingInvitationApi, accountSharingMemberApi } from '@/apis'
import { IAccountDataResponse, IAccountSharingMemberInfo, IErrorResponse } from '@/interfaces'

export const SharingAccount = () => {
  const { accountId } = useParams()

  const [emailMember, setEmailMember] = useState<string>('')

  const [sharingMembers, setSharingMembers] = useState<IAccountSharingMemberInfo[]>([])

  const { data: accountData, isPending } = useQuery<IAccountDataResponse, AxiosError<IErrorResponse>>({
    ...accountKeys.detail(accountId as string),
    enabled: !!accountId
  })

  const [api, contextHolder] = notification.useNotification()
  notification.useNotification({ maxCount: 3 })

  const handleOpenNotification = (description: string) => {
    api.warning({
      description,
      message: 'Warning',
      placement: 'topRight'
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (!inputValue.startsWith(' ')) {
      setEmailMember(inputValue)
    }
  }

  const handleAddMember = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()

      const trimmedEmail = emailMember.trim()

      if (!trimmedEmail || !VALIDATION_REGEX.EMAIL_REGEX.test(trimmedEmail)) {
        handleOpenNotification('Please enter a valid email')
        return
      }
      const isEmailExists = sharingMembers.some((member) => member.email === trimmedEmail)
      const isOwnerEmail = trimmedEmail === accountData?.owner.email

      if (isEmailExists || isOwnerEmail) {
        handleOpenNotification('This email was existed')
        return
      }
      const newSharingMember = {
        email: trimmedEmail,
        roleAccess: ROLE_ACCESS.READ
      }
      setSharingMembers((prev) => [...prev, newSharingMember])
      setEmailMember('')
    }
  }

  const handleChangeMemberRoleAccess = (member: IAccountSharingMemberInfo) => {
    const updateSharingMembers = sharingMembers.map((currentMember) => {
      if (currentMember.email === member.email) {
        return {
          ...currentMember,
          roleAccess: member.roleAccess
        }
      }
      return currentMember
    })

    setSharingMembers(updateSharingMembers)
  }

  const handleRemoveMember = (member: IAccountSharingMemberInfo) => {
    const updateSharingMembers = sharingMembers.filter((currentMember) => currentMember.email !== member.email)
    setSharingMembers(updateSharingMembers)
  }

  const { mutate: mutateSharingAccount, isPending: isPendingSharingAccount } = useMutation({
    mutationFn: accountSharingInvitationApi.create,
    onSuccess: () => {
      window.close()
    },
    onError: (error: AxiosError) => {
      const errorMessage = (error.response?.data as IErrorResponse)?.message
      message.error(errorMessage)
    }
  })

  const { mutate: mutateUpdateRoleAccess, isPending: isPendingUpdateRoleAccess } = useMutation({
    mutationFn: accountSharingMemberApi.updateRoleAccess,
    onSuccess: () => {
      window.close()
    },
    onError: () => {
      window.close()
    }
  })

  const handleDoneSharingAccount = () => {
    if (accountData)
      if (sharingMembers?.length > accountData?.members.length) {
        mutateSharingAccount({
          accountId: accountData.id,
          ownerId: accountData.owner.id as string,
          sharingMembers
        })
      } else {
        mutateUpdateRoleAccess({ accountId: accountData.id, ownerId: accountData.owner.id as string, sharingMembers })
      }
  }

  const hasSharingMembersChanged = (): boolean => {
    if (!accountData?.members) return false
    if (sharingMembers.length !== accountData.members.length) return true
    return sharingMembers.some(
      (member, index) =>
        member.email === accountData.members[index].email && member.roleAccess !== accountData.members[index].roleAccess
    )
  }

  const handleCloseShare = () => {
    window.close()
  }

  useEffect(() => {
    if (accountData && accountData?.members?.length > 0) {
      setSharingMembers(accountData?.members)
    }
  }, [accountData?.members])

  return (
    <section className='flex h-screen'>
      {isPending ? (
        <Spin size='large' className='m-auto' />
      ) : (
        <div className='relative flex flex-col box-border min-h-[188px] border border-[#d5d9de] m-auto rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.1)] w-[550px] py-6'>
          {contextHolder}
          <div className='flex justify-between items-center px-6'>
            <h2 className='text-2xl text-slate-800 font-normal'>Share "{accountData?.username}"</h2>
            <button className='hover:bg-gray-300 cursor-pointer' onClick={handleCloseShare}>
              <span className='text-3xl text-gray-600 font-semibold '>{icons.close}</span>
            </button>
          </div>
          <div className='mt-5 px-6'>
            <CustomInput
              name='email'
              size='large'
              placeholder='Add people'
              value={emailMember}
              onChange={handleChange}
              onKeyDown={handleAddMember}
              className='text-lg font-medium h-full px-5 py-3.5 border-1 border-slate-500 rounded-md hover:border-primary-800 focus-within:shadow-custom'
            />
          </div>
          {accountData && (
            <div className='mt-4 max-h-[500px] overflow-y-auto'>
              <h2 className='font-medium text-lg px-6'>People with access</h2>
              <ul className='mt-2'>
                <CardSharingMember type='owner' member={accountData.owner} />
                {sharingMembers?.length > 0 &&
                  sharingMembers?.map((member) => (
                    <CardSharingMember
                      key={member.email}
                      type='member'
                      member={member}
                      roleAccess={member.roleAccess}
                      disableChangeRoleAccess={
                        member.roleAccess === ROLE_ACCESS.MANAGE &&
                        accountData.members.some((existedMember) => existedMember.email === member.email)
                      }
                      handleRemoveMember={handleRemoveMember}
                      handleChangeMemberRoleAccess={handleChangeMemberRoleAccess}
                    />
                  ))}
              </ul>
            </div>
          )}

          <div className='mt-4 px-6 flex justify-between items-center'>
            <CustomBtn
              title='Done'
              type='primary'
              className='!w-fit !text-sm'
              onClick={handleDoneSharingAccount}
              loading={isPendingSharingAccount || isPendingUpdateRoleAccess}
              disabled={!hasSharingMembersChanged() || isPendingSharingAccount || isPendingUpdateRoleAccess}
            />
          </div>
        </div>
      )}
    </section>
  )
}
