export type RequestStatus =
  | 'Submitted'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled';

export interface RequestListItem {
  id: string;
  protocolNumber: string;
  title: string;
  status: RequestStatus;
  responsibleUserId: string | null;
  dueDateUtc: string | null;
  createdAtUtc: string;
  version: string;
}

export interface PagedRequests {
  items: RequestListItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ListRequestsQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: RequestStatus;
}

export interface RequestDetails {
  id: string;
  protocolNumber: string;
  title: string;
  description: string;
  status: RequestStatus;
  responsibleUserId: string | null;
  dueDateUtc: string | null;
  createdAtUtc: string;
  version: string;
}

export interface CreateRequestInput {
  title: string;
  description: string;
}

export interface CreateRequestResult {
  id: string;
  protocolNumber: string;
  status: RequestStatus;
  createdAtUtc: string;
  version: string;
}

export interface RequestMutationResult {
  id: string;
  protocolNumber: string;
  status: RequestStatus;
  responsibleUserId: string | null;
  dueDateUtc: string | null;
  version: string;
}

export interface AssignResponsibleInput {
  responsibleUserId: string;
  version: string;
}

export interface ChangeRequestStatusInput {
  status: RequestStatus;
  version: string;
}

export interface SetRequestDueDateInput {
  dueDateUtc: string | null;
  version: string;
}

export interface RequestComment {
  id: string;
  authorUserId: string;
  content: string;
  createdAtUtc: string;
}

export interface PagedRequestComments {
  items: RequestComment[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface RequestAuditRecord {
  id: string;
  eventId: string;
  actorUserId: string;
  action:
    | 'RequestCreated'
    | 'ResponsibleAssigned'
    | 'StatusChanged'
    | 'DueDateChanged'
    | 'CommentAdded'
    | 'AttachmentAdded'
    | string;
  data: Record<string, unknown>;
  occurredAtUtc: string;
}

export interface PagedRequestAudit {
  items: RequestAuditRecord[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
