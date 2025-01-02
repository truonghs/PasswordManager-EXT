import { ROLE_ACCESS, RoleAccess } from '@/utils/constants';
import { IAccountDataResponse, IWorkspaceDataResponse } from '@/interfaces';

type AccountOrWorkspace = IAccountDataResponse | IWorkspaceDataResponse;

export const checkRoleAccess = (currentUserId: string, data: AccountOrWorkspace) => {

  const isOwner = currentUserId === data.owner.id;

  const hasRoleAccess = (role: RoleAccess) =>
    data.members.some((member) => member.id === currentUserId && member.roleAccess === role);

  return {
    showAction: isOwner || data.members.some((member) => member.roleAccess !== ROLE_ACCESS.READ),
    showShare: isOwner || hasRoleAccess(ROLE_ACCESS.MANAGE),
    showEdit: isOwner || hasRoleAccess(ROLE_ACCESS.MANAGE) || hasRoleAccess(ROLE_ACCESS.UPDATE),
    showDelete: isOwner,
  };
};
