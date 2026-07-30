export type TenantRole = 'Administrator' | 'Operator' | 'Reader';

export interface TenantMembership {
  userId: string;
  role: TenantRole;
  permissions: string[];
  updatedAtUtc: string;
}
