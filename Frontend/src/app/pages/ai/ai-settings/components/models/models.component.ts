import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '../../../../../shared/directive/click-outside.directive';

export interface AIModel {
  name: string;
  badge: string;
  provider: 'OpenAI' | 'Anthropic' | 'Google' | 'xAI';
  generation: 'Text' | 'Image' | 'Video' | 'Code';
  icon: 'gpt' | 'claude' | 'google' | 'grok';
  enabled: boolean;
}

@Component({
  selector: 'app-ai-settings-models',
  standalone: true,
  imports: [CommonModule, FormsModule, ClickOutsideDirective],
  templateUrl: './models.component.html'
})
export class ModelsComponent {
  @Input() activeTab: string = 'account';

  search: string = '';
  provider: string = 'Provider';
  generation: string = 'All Generation';
  providerOpen: boolean = false;
  generationOpen: boolean = false;

  models: AIModel[] = [
    { name: 'ChatGPT 5.5', badge: 'New', provider: 'OpenAI', generation: 'Text', icon: 'gpt', enabled: false },
    { name: 'ChatGPT 4.5', badge: '', provider: 'OpenAI', generation: 'Text', icon: 'gpt', enabled: true },
    { name: 'Claude Sonnet 4.6', badge: 'New', provider: 'Anthropic', generation: 'Text', icon: 'claude', enabled: false },
    { name: 'Claude Sonnet 4.6', badge: '', provider: 'Anthropic', generation: 'Text', icon: 'claude', enabled: false },
    { name: 'Gemini 3.1 Pro', badge: '', provider: 'Google', generation: 'Text', icon: 'google', enabled: false },
    { name: 'Gemini 3 Flash', badge: '', provider: 'Google', generation: 'Text', icon: 'google', enabled: false },
    { name: 'Grok 3', badge: '', provider: 'xAI', generation: 'Text', icon: 'grok', enabled: false },
    { name: 'Grok 2.0', badge: '', provider: 'xAI', generation: 'Text', icon: 'grok', enabled: false }
  ];

  setProvider(p: string) {
    this.provider = p;
    this.providerOpen = false;
  }

  setGeneration(g: string) {
    this.generation = g;
    this.generationOpen = false;
  }

  filteredModels(): AIModel[] {
    return this.models.filter(m => {
      // Search term match
      if (this.search && !m.name.toLowerCase().includes(this.search.toLowerCase())) {
        return false;
      }
      // Provider filter match
      if (this.provider !== 'Provider' && m.provider !== this.provider) {
        return false;
      }
      // Generation filter match
      if (this.generation !== 'All Generation' && m.generation !== this.generation) {
        return false;
      }
      return true;
    });
  }
}
