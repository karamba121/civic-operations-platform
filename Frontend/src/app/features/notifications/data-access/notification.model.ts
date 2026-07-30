export interface NotificationListItem {
  id: string;
  requestId: string;
  protocolNumber: string;
  type: string;
  title: string;
  content: string;
  createdAtUtc: string;
}

export interface PagedNotifications {
  items: NotificationListItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
