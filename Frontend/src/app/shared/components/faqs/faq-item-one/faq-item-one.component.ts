import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-faq-item-one',
  imports: [
    CommonModule
  ],
  templateUrl: './faq-item-one.component.html',
  styles: ``
})
export class FaqItemOneComponent {
  @Input() title: string = '';
  @Input() content: string = '';
  @Input() isOpen: boolean = false;
  @Input() toggleAccordion: () => void = () => {};
}
