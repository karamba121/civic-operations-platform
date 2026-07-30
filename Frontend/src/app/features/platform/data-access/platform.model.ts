export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAtUtc: string;
}

export interface ManagedUserSummary {
  id: string;
  username: string;
  displayName: string;
  email: string;
  tenantId: string | null;
  isPlatformAdministrator: boolean;
  role: 'Administrator' | 'Operator' | 'Reader' | null;
  isActive: boolean;
  createdAtUtc: string;
}

export interface CreateTenantPayload {
  name: string;
  slug: string;
  administratorUsername: string;
  administratorDisplayName: string;
  administratorEmail: string;
  administratorPassword: string;
}

export interface CreatePlatformAdministratorPayload {
  username: string;
  displayName: string;
  email: string;
  password: string;
}

export interface CreateTenantUserPayload {
  username: string;
  displayName: string;
  email: string;
  password: string;
  role: 'Administrator' | 'Operator' | 'Reader';
}
