import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CommonModule } from '@angular/common';
import { ChatHeaderComponent } from '../../shared/components/chats/chat-header/chat-header.component';
import { ChatListComponent } from '../../shared/components/chats/chat-list/chat-list.component';
import { ChatBoxComponent } from '../../shared/components/chats/chat-box/chat-box.component';

@Component({
  selector: 'app-chats',
  imports: [
    PageBreadcrumbComponent,
    CommonModule,
    ChatHeaderComponent,
    ChatListComponent,
    ChatBoxComponent
  ],
  templateUrl: './chats.component.html',
  styles: ``
})
export class ChatsComponent {

  isOpen = false;

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
  }
}
