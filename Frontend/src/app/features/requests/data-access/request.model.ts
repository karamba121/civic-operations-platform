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
