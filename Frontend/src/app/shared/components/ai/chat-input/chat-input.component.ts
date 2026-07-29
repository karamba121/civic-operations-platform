import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../../directive/click-outside.directive';
import { TooltipDirective } from '../../../directive/tooltip.directive';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ClickOutsideDirective, TooltipDirective],
  templateUrl: './chat-input.component.html',
  styles: ``
})
export class ChatInputComponent {
  @Input() placeholder = 'Ask anything to build...';
  @Input() selectedModel = 'Claude Sonnet 4.6';
  @Input() showModelDropdown = true;
  @Input() modelDropdownOpen = false;
  @Input() showUpload = true;

  @Output() send = new EventEmitter<string>();
  @Output() fileSelected = new EventEmitter<File>();
  @Output() modelSelected = new EventEmitter<string>();

  promptInput = '';

  toggleModelDropdown() {
    this.modelDropdownOpen = !this.modelDropdownOpen;
  }

  closeModelDropdown() {
    this.modelDropdownOpen = false;
  }

  selectModel(model: string) {
    this.selectedModel = model;
    this.modelDropdownOpen = false;
    this.modelSelected.emit(model);
  }

  onSend() {
    if (!this.promptInput.trim()) return;
    this.send.emit(this.promptInput.trim());
    this.promptInput = '';
  }

  onFileChange(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.fileSelected.emit(file);
    }
  }
}
