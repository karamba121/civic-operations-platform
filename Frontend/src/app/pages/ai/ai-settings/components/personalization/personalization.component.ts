import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-settings-personalization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './personalization.component.html'
})
export class PersonalizationComponent {
  @Input() activeTab: string = 'account';

  tone: string = 'Concise';
  creativity: number = 60;
  outputLength: string = 'Short';
  instructions: string = '';
  nickname: string = '';
  occupation: string = '';
  aboutYou: string = '';
}
