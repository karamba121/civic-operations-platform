import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../../directive/click-outside.directive';
import { ChatHeaderComponent } from '../chat-header/chat-header.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { ShareModalComponent } from '../share-modal/share-modal.component';
import { TooltipDirective } from '../../../directive/tooltip.directive';

export interface VideoChatMessage {
  role: 'user' | 'ai';
  text: string;
  isEditing?: boolean;
  draft?: string;
  copied?: boolean;
  videoThumb?: string;
  videoUrl?: string;
  videoCopied?: boolean;
  model?: string;
  modelIcon?: string;
}

@Component({
  selector: 'app-video-generator-content',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ClickOutsideDirective,
    ShareModalComponent,
    ChatHeaderComponent,
    ChatInputComponent,
    TooltipDirective
  ],
  templateUrl: './video-generator-content.component.html',
  styles: ``
})
export class VideoGeneratorContentComponent {
  // Chat messages
  messages: VideoChatMessage[] = [
    {
      role: 'user',
      text: 'Minimalist building facade with vertical panels and greenery in a planter, set against a clear blue sky for a modern aesthetic.'
    },
    {
      role: 'ai',
      text: 'I have generated Minimalist building facade with vertical panels and greenery in a planter, set against a clear blue sky for a modern aesthetic.',
      videoThumb: './images/ai/video-thumb.png',
      videoUrl: 'https://www.youtube.com/watch?v=_iHmNaQBtKk',
      model: 'Google Veo 3.1',
      modelIcon: './images/model/google.svg'
    }
  ];

  // Prompt input
  promptInput = '';

  // Select Model Dropdown
  modelDropdownOpen = false;
  selectedModel = 'Google Veo 3.1';

  // Aspect Ratio Dropdown
  aspectRatioDropdownOpen = false;
  selectedAspectRatio = '3:4';

  // Variants Dropdown
  variantsDropdownOpen = false;
  selectedVariants = '1';

  // Resolution Dropdown
  resolutionDropdownOpen = false;
  selectedResolution = '2K';

  // Duration Dropdown
  durationDropdownOpen = false;
  selectedDuration = '30s';

  // Audio Toggle
  audioOn = true;

  // Mobile Settings Panel
  mobileSettingsOpen = false;
  mobileActiveMenu: 'aspect-ratio' | 'variants' | 'resolution' | 'duration' | null = null;

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
      this.durationDropdownOpen = false;
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
      this.durationDropdownOpen = false;
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
      this.durationDropdownOpen = false;
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
      this.durationDropdownOpen = false;
    }
  }

  closeResolutionDropdown() {
    this.resolutionDropdownOpen = false;
  }

  selectResolution(res: string) {
    this.selectedResolution = res;
    this.resolutionDropdownOpen = false;
  }

  // Duration Methods
  toggleDurationDropdown() {
    this.durationDropdownOpen = !this.durationDropdownOpen;
    if (this.durationDropdownOpen) {
      this.modelDropdownOpen = false;
      this.aspectRatioDropdownOpen = false;
      this.variantsDropdownOpen = false;
      this.resolutionDropdownOpen = false;
    }
  }

  closeDurationDropdown() {
    this.durationDropdownOpen = false;
  }

  selectDuration(dur: string) {
    this.selectedDuration = dur;
    this.durationDropdownOpen = false;
  }

  // Audio Toggle Methods
  toggleAudio() {
    this.audioOn = !this.audioOn;
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
      this.durationDropdownOpen = false;
    }
  }

  closeMobileSettings() {
    this.mobileSettingsOpen = false;
    this.mobileActiveMenu = null;
  }

  setMobileActiveMenu(menu: 'aspect-ratio' | 'variants' | 'resolution' | 'duration' | null) {
    this.mobileActiveMenu = menu;
  }

  // User Message Methods
  editMessage(msg: VideoChatMessage) {
    msg.isEditing = true;
    msg.draft = msg.text;
  }

  cancelEdit(msg: VideoChatMessage) {
    msg.isEditing = false;
  }

  saveEdit(msg: VideoChatMessage) {
    if (msg.draft && msg.draft.trim()) {
      msg.text = msg.draft.trim();
    }
    msg.isEditing = false;
  }

  copyMessage(msg: VideoChatMessage) {
    navigator.clipboard.writeText(msg.text).then(() => {
      msg.copied = true;
      setTimeout(() => msg.copied = false, 2000);
    });
  }

  // Video Actions
  downloadVideo(msg: VideoChatMessage) {
    if (!msg.videoThumb) return;
    const link = document.createElement('a');
    link.href = msg.videoThumb; // simulate download of the video thumbnail
    link.download = 'generated-video.png';
    link.click();
  }

  copyVideoLink(msg: VideoChatMessage) {
    if (!msg.videoUrl) return;
    navigator.clipboard.writeText(msg.videoUrl).then(() => {
      msg.videoCopied = true;
      setTimeout(() => msg.videoCopied = false, 2000);
    });
  }

  // Send Message
  sendMessage(text: string) {
    if (!text.trim()) return;

    this.messages.push({
      role: 'user',
      text: text.trim()
    });

    const modelIcons: Record<string, string> = {
      'Google Veo 3.1': './images/model/google.svg',
      'Kling 3.0 Pro': './images/model/kling.svg',
      'Seedream 5.0': './images/model/seedream.svg',
      'Runway 4.5': './images/model/runway.svg',
      'xAI Grok Video': './images/model/grok-light.svg',
      'Wen 2.6': './images/model/qwen.svg'
    };

    const currentModel = this.selectedModel;
    const currentModelIcon = modelIcons[currentModel] || './images/model/google.svg';

    // // Simulate AI response
    // setTimeout(() => {
    //   this.messages.push({
    //     role: 'ai',
    //     text: `I have generated Minimalist building facade with vertical panels and greenery in a planter, set against a clear blue sky for a modern aesthetic.`,
    //     videoThumb: './images/ai/video-thumb.png',
    //     videoUrl: 'https://www.youtube.com/watch?v=_iHmNaQBtKk',
    //     model: currentModel,
    //     modelIcon: currentModelIcon
    //   });
    // }, 1500);
  }

  // Regenerate video
  regenerateVideo(msg: VideoChatMessage) {
    const index = this.messages.indexOf(msg);
    let promptText = '';
    if (index > 0 && this.messages[index - 1].role === 'user') {
      promptText = this.messages[index - 1].text;
    } else {
      promptText = 'Minimalist building facade with vertical panels and greenery in a planter, set against a clear blue sky for a modern aesthetic.';
    }

    this.sendMessage(promptText);
  }
}
