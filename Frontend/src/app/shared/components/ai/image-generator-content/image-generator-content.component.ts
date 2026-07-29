import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../../directive/click-outside.directive';
import { ShareModalComponent } from '../share-modal/share-modal.component';
import { ChatHeaderComponent } from '../chat-header/chat-header.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { TooltipDirective } from '../../../directive/tooltip.directive';

export interface ImageChatMessage {
  role: 'user' | 'ai';
  text: string;
  isEditing?: boolean;
  draft?: string;
  copied?: boolean;
  imageSrc?: string;
  imageCopied?: boolean;
  model?: string;
}

@Component({
  selector: 'app-image-generator-content',
  imports: [
    CommonModule,
    FormsModule,
    ClickOutsideDirective,
    ShareModalComponent,
    ChatHeaderComponent,
    ChatInputComponent,
    TooltipDirective
  ],
  templateUrl: './image-generator-content.component.html',
  styles: ``
})
export class ImageGeneratorContentComponent {
  // Chat messages
  messages: ImageChatMessage[] = [
    {
      role: 'user',
      text: 'Minimalist building facade with vertical panels and greenery in a planter, set against a clear blue sky for a modern aesthetic.'
    },
    {
      role: 'ai',
      text: 'I have generated Minimalist building facade with vertical panels and greenery in a planter, set against a clear blue sky for a modern aesthetic.',
      imageSrc: './images/ai/img-1.png',
      model: 'Nano Banana 2.0'
    }
  ];

  // Prompt input
  promptInput = '';
  attachedFileName = '';

  // Select Model Dropdown
  modelDropdownOpen = false;
  selectedModel = 'Nano Banana Pro';

  // Aspect Ratio Dropdown
  aspectRatioDropdownOpen = false;
  selectedAspectRatio = '3:4';

  // Variants Dropdown
  variantsDropdownOpen = false;
  selectedVariants = '1';

  // Resolution Dropdown
  resolutionDropdownOpen = false;
  selectedResolution = '2K';

  // Mobile Settings Panel
  mobileSettingsOpen = false;
  mobileActiveMenu: 'aspect-ratio' | 'variants' | 'resolution' | null = null;

  // Share Modal
  isShareModalOpen = false;

  openShareModal() {
    this.isShareModalOpen = true;
  }

  closeShareModal() {
    this.isShareModalOpen = false;
  }

  // Model Selector Methods
  toggleModelDropdown() {
    this.modelDropdownOpen = !this.modelDropdownOpen;
    if (this.modelDropdownOpen) {
      this.aspectRatioDropdownOpen = false;
      this.variantsDropdownOpen = false;
      this.resolutionDropdownOpen = false;
    }
  }

  closeModelDropdown() {
    this.modelDropdownOpen = false;
  }

  selectModel(model: string) {
    this.selectedModel = model;
    this.modelDropdownOpen = false;
  }

  // Aspect Ratio Methods
  toggleAspectRatioDropdown() {
    this.aspectRatioDropdownOpen = !this.aspectRatioDropdownOpen;
    if (this.aspectRatioDropdownOpen) {
      this.modelDropdownOpen = false;
      this.variantsDropdownOpen = false;
      this.resolutionDropdownOpen = false;
    }
  }

  closeAspectRatioDropdown() {
    this.aspectRatioDropdownOpen = false;
  }

  selectAspectRatio(ratio: string) {
    this.selectedAspectRatio = ratio;
    this.aspectRatioDropdownOpen = false;
  }

  // Variants Methods
  toggleVariantsDropdown() {
    this.variantsDropdownOpen = !this.variantsDropdownOpen;
    if (this.variantsDropdownOpen) {
      this.modelDropdownOpen = false;
      this.aspectRatioDropdownOpen = false;
      this.resolutionDropdownOpen = false;
    }
  }

  closeVariantsDropdown() {
    this.variantsDropdownOpen = false;
  }

  selectVariants(variants: string) {
    this.selectedVariants = variants;
    this.variantsDropdownOpen = false;
  }

  // Resolution Methods
  toggleResolutionDropdown() {
    this.resolutionDropdownOpen = !this.resolutionDropdownOpen;
    if (this.resolutionDropdownOpen) {
      this.modelDropdownOpen = false;
      this.aspectRatioDropdownOpen = false;
      this.variantsDropdownOpen = false;
    }
  }

  closeResolutionDropdown() {
    this.resolutionDropdownOpen = false;
  }

  selectResolution(res: string) {
    this.selectedResolution = res;
    this.resolutionDropdownOpen = false;
  }

  // Mobile settings methods
  toggleMobileSettings() {
    this.mobileSettingsOpen = !this.mobileSettingsOpen;
    this.mobileActiveMenu = null;
    if (this.mobileSettingsOpen) {
      this.modelDropdownOpen = false;
      this.aspectRatioDropdownOpen = false;
      this.variantsDropdownOpen = false;
      this.resolutionDropdownOpen = false;
    }
  }

  closeMobileSettings() {
    this.mobileSettingsOpen = false;
    this.mobileActiveMenu = null;
  }

  setMobileActiveMenu(menu: 'aspect-ratio' | 'variants' | 'resolution' | null) {
    this.mobileActiveMenu = menu;
  }

  // File selection
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.attachedFileName = file.name;
    }
  }

  clearAttachedFile() {
    this.attachedFileName = '';
  }

  // User Message Methods
  editMessage(msg: ImageChatMessage) {
    msg.isEditing = true;
    msg.draft = msg.text;
  }

  cancelEdit(msg: ImageChatMessage) {
    msg.isEditing = false;
  }

  saveEdit(msg: ImageChatMessage) {
    if (msg.draft && msg.draft.trim()) {
      msg.text = msg.draft.trim();
    }
    msg.isEditing = false;
  }

  copyMessage(msg: ImageChatMessage) {
    navigator.clipboard.writeText(msg.text).then(() => {
      msg.copied = true;
      setTimeout(() => msg.copied = false, 2000);
    });
  }

  // Image actions on AI Message
  downloadImage(msg: ImageChatMessage) {
    if (!msg.imageSrc) return;
    const link = document.createElement('a');
    link.href = msg.imageSrc;
    link.download = 'generated-image.png';
    link.click();
  }

  copyImageLink(msg: ImageChatMessage) {
    if (!msg.imageSrc) return;
    const absoluteUrl = window.location.origin + msg.imageSrc.replace(/^\./, '');
    navigator.clipboard.writeText(absoluteUrl).then(() => {
      msg.imageCopied = true;
      setTimeout(() => msg.imageCopied = false, 2000);
    });
  }

  regenerateImage(msg: ImageChatMessage) {
    // Find matching user query if any, or use the prompt message text
    const index = this.messages.indexOf(msg);
    let promptText = '';
    if (index > 0 && this.messages[index - 1].role === 'user') {
      promptText = this.messages[index - 1].text;
    } else {
      promptText = msg.text;
    }
    
    // Simulate generation
    this.messages.push({
      role: 'user',
      text: `${promptText}`
    });
    
    setTimeout(() => {
      this.messages.push({
        role: 'ai',
        text: `I have generated ${promptText}`,
        imageSrc: `./images/ai/img-${Math.floor(Math.random() * 4) + 1}.png`,
        model: this.selectedModel
      });
    }, 1200);
  }

  editImagePrompt(msg: ImageChatMessage) {
    // Copy the text of the prompt to the bottom text input
    this.promptInput = msg.text.replace(/^I have generated /, '');
  }

  sendMessage(prompt?: string) {
    const promptText = prompt ? prompt.trim() : this.promptInput.trim();
    if (!promptText) return;

    this.messages.push({
      role: 'user',
      text: promptText
    });

    this.promptInput = '';
    this.attachedFileName = '';

    // Simulate AI Image response
    setTimeout(() => {
      // Pick a random image from 1 to 4
      const randomImgNum = Math.floor(Math.random() * 4) + 1;
      this.messages.push({
        role: 'ai',
        text: `I have generated ${promptText}`,
        imageSrc: `./images/ai/img-${randomImgNum}.png`,
        model: this.selectedModel
      });
    }, 1500);
  }
}
