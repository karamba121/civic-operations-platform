import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progressbar-item',
  imports: [
    CommonModule,
  ],
  templateUrl: './progressbar-item.component.html',
  styles: ``
})
export class ProgressbarItemComponent {

  @Input() progress!: number;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'sm';
  @Input() label: 'none' | 'outside' | 'inside' = 'none';
  @Input() className = '';

  get sizeClass(): string {
    return {
      sm: 'h-2',
      md: 'h-3',
      lg: 'h-4',
      xl: 'h-5'
    }[this.size];
  }

  get baseClasses(): string {
    return 'relative w-full bg-gray-200 rounded-full dark:bg-gray-800';
  }

  get progressClasses(): string {
    return 'absolute left-0 h-full bg-brand-500 rounded-full';
  }
}
