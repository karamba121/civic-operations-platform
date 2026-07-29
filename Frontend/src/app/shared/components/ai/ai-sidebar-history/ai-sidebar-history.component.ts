import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ChatHistoryItem {
  id: string;
  title: string;
  isStarred?: boolean;
}
@Component({
  selector: 'app-ai-sidebar-history',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './ai-sidebar-history.component.html',
  styles: ``,
})
export class AiSidebarHistoryComponent {

  @Input() isSidebarOpen: boolean = false;
  @Output() closeSidebar = new EventEmitter<void>();

  searchQuery: string = '';
  showMore: boolean = false;
  openDropdown: string | null = null;

  starredChats: ChatHistoryItem[] = [
    { id: '1', title: 'Write a follow-up email to a client', isStarred: false },
    { id: '2', title: 'Generate responsive login form layout', isStarred: false },
    { id: '3', title: 'Create a warning state modal', isStarred: false },
    { id: '4', title: 'Suggest color palette for dark theme', isStarred: false },
  ];

  recentChats: ChatHistoryItem[] = [
    { id: '5', title: 'Improve login page accessibility', isStarred: false },
    { id: '6', title: 'Create a warning state modal with animation', isStarred: false },
    { id: '7', title: 'Add password visibility toggle', isStarred: false },
    { id: '8', title: 'Write validation logic for login form...', isStarred: false },
    { id: '9', title: 'Fix mobile responsiveness of login UI...', isStarred: false },
  ];

  lastWeekChats: ChatHistoryItem[] = [
    { id: '10', title: 'Improve login page accessibility...', isStarred: false },
    { id: '11', title: 'Improve login page accessibility...', isStarred: false },
  ];

  ngOnInit(): void {
    document.addEventListener('mousedown', this.handleClickOutside.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousedown', this.handleClickOutside.bind(this));
  }

  handleClickOutside(event: MouseEvent): void {
    if (this.openDropdown && !(event.target as HTMLElement).closest('.dropdown-menu, .dropdown-button')) {
      this.openDropdown = null;
    }
  }

  onCloseSidebar(event: Event): void {
    event.stopPropagation();
    this.closeSidebar.emit();
  }

  handleDropdownToggle(itemId: string): void {
    this.openDropdown = this.openDropdown === itemId ? null : itemId;
  }

  handleRename(itemId: string): void {
    console.log('Rename item:', itemId);
    this.openDropdown = null;
  }

  handleDelete(itemId: string): void {
    console.log('Delete item:', itemId);
    this.openDropdown = null;
  }

  toggleStar(chat: ChatHistoryItem): void {
    chat.isStarred = !chat.isStarred;
  }

  toggleShowMore(): void {
    this.showMore = !this.showMore;
  }
}
