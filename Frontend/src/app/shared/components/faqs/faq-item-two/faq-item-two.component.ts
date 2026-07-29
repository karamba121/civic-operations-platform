import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-faq-item-two',
  imports: [
    CommonModule,
  ],
  templateUrl: './faq-item-two.component.html',
  styles: ``
})
export class FaqItemTwoComponent {

  
  @Input() title: string = '';
  @Input() content: string = '';
  @Input() isOpen: boolean = false;

  // Emit toggle event to parent
  @Output() toggle = new EventEmitter<void>();

  onToggle(): void {
    this.toggle.emit();
  }

}
