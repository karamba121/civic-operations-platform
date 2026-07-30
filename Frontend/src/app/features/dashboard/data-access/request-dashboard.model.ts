export type RequestStatus =
  | 'Submitted'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled';

export interface RequestDashboardRecentItem {
  id: string;
  protocolNumber: string;
  title: string;
  status: RequestStatus;
  responsibleUserId: string | null;
  dueDateUtc: string | null;
  createdAtUtc: string;
}

export interface RequestDashboard {
  total: number;
  submitted: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  dueSoon: number;
  unassignedActive: number;
  recent: RequestDashboardRecentItem[];
}
