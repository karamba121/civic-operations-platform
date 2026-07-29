import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-settings-memory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './memory.component.html'
})
export class MemoryComponent {
  @Input() activeTab: string = 'account';

  enableMemory: boolean = true;
  saveConversations: boolean = false;
  selectedTab: 'add-memory' | 'import-chats' = 'add-memory';

  createFolder() {
    alert('Creating a new folder to organize stored context.');
  }

  clearMemory() {
    if (confirm('Permanently delete all stored facts and context memories? This action is immediate and final.')) {
      alert('Stored context has been deleted successfully.');
    }
  }
}
