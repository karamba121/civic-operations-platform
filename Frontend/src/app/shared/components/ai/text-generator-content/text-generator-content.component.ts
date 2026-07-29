import { Component } from '@angular/core';
import { ClickOutsideDirective } from '../../../directive/click-outside.directive';
import { FormsModule } from '@angular/forms';
import { ShareModalComponent } from '../share-modal/share-modal.component';
import { ChatHeaderComponent } from '../chat-header/chat-header.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { TooltipDirective } from '../../../directive/tooltip.directive';

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  isEditing?: boolean;
  draft?: string;
  copied?: boolean;
  liked?: boolean;
  disliked?: boolean;
}

@Component({
  selector: 'app-text-generator-content',
  imports: [
    ClickOutsideDirective,
    FormsModule,
    ShareModalComponent,
    ChatHeaderComponent,
    ChatInputComponent,
    TooltipDirective
  ],
  templateUrl: './text-generator-content.component.html',
  styles: ``,
})
export class TextGeneratorContentComponent {
  // Chat messages
  messages: ChatMessage[] = [
    {
      role: 'user',
      text: "Can you generate some random, creative, and engaging placeholder text for me? It doesn't need to follow any specific structure—just something fun or interesting to fill space temporarily.",
    },
    {
      role: 'ai',
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus et varius tortor. Aenean dui magna, vehicula in lacinia non, euismod sed odio. Aliquam erat volutpat. Integer iaculis eu tellus vel tincidunt. Sed sed dictum orci, in pretium erat. Proin ut mi a arcu mollis hendrerit. Ut id est finibus, egestas tellus ac, pharetra ante."
    },
    {
      role: 'user',
      text: "I'm looking for a block of random, imaginative text—something quirky or unexpected to use as placeholder content."
    },
    {
      role: 'ai',
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus et varius tortor. Aenean dui magna, vehicula in lacinia non, euismod sed odio. Aliquam erat volutpat.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus et varius tortor. Aenean dui magna, vehicula in lacinia non, euismod sed odio. Aliquam erat volutpat."
    }
  ];

  // Bottom Input
  promptInput = '';

  // Select Model Dropdown
  modelDropdownOpen = false;
  selectedModel = 'Claude Sonnet 4.6';
  
  // Action Dropdown (Plus icon)
  actionDropdownOpen = false;
  selectedInputAction = '';

  // Methods
  isShareModalOpen = false;

  openShareModal() {
    this.isShareModalOpen = true;
  }

  closeShareModal() {
    this.isShareModalOpen = false;
  }

  // Message methods
  editMessage(msg: ChatMessage) {
    msg.isEditing = true;
    msg.draft = msg.text;
  }

  cancelEdit(msg: ChatMessage) {
    msg.isEditing = false;
  }

  saveEdit(msg: ChatMessage) {
    if (msg.draft && msg.draft.trim()) {
      msg.text = msg.draft.trim();
    }
    msg.isEditing = false;
  }

  copyMessage(msg: ChatMessage) {
    navigator.clipboard.writeText(msg.text).then(() => {
      msg.copied = true;
      setTimeout(() => msg.copied = false, 2000);
    });
  }

  toggleLike(msg: ChatMessage) {
    msg.liked = !msg.liked;
    if (msg.liked) msg.disliked = false;
  }

  toggleDislike(msg: ChatMessage) {
    msg.disliked = !msg.disliked;
    if (msg.disliked) msg.liked = false;
  }
  
  // Bottom action methods
  toggleActionDropdown() {
    this.actionDropdownOpen = !this.actionDropdownOpen;
  }
  
  closeActionDropdown() {
    this.actionDropdownOpen = false;
  }
  
  selectInputAction(action: string) {
    this.selectedInputAction = action;
    this.actionDropdownOpen = false;
  }
  
  clearInputAction() {
    this.selectedInputAction = '';
  }
  
  toggleModelDropdown() {
    this.modelDropdownOpen = !this.modelDropdownOpen;
  }
  
  closeModelDropdown() {
    this.modelDropdownOpen = false;
  }
  
  selectModel(model: string) {
    this.selectedModel = model;
    this.modelDropdownOpen = false;
  }
  
  sendMessage(prompt: string) {
    if (!prompt || !prompt.trim()) return;
    
    this.messages.push({
      role: 'user',
      text: prompt.trim()
    });
    
    // Simulate AI response
    setTimeout(() => {
      this.messages.push({
        role: 'ai',
        text: 'This is a simulated AI response to: ' + this.messages[this.messages.length - 1].text
      });
    }, 1000);
  }
}
