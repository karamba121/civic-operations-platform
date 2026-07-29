import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../types/Task';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-item',
  imports: [
    CommonModule,
  ],
  templateUrl: './task-item.component.html',
  styles: ``
})
export class TaskItemComponent {

  @Input() task!: Task;

  @Output() dragStart = new EventEmitter<DragEvent>();
  @Output() toggleChecked = new EventEmitter<void>();

  onDragStart(event: DragEvent) {
    this.dragStart.emit(event);
  }

  onToggleChecked() {
    this.toggleChecked.emit();
  }

  getTagClass = (color: string) => {
    const baseClasses = 'px-2 py-0.5 text-xs font-medium'
    switch (color) {
      case 'brand':
        return `${baseClasses} bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400`
      case 'gray':
        return `${baseClasses} bg-gray-100 text-gray-700 dark:bg-white/[0.03] dark:text-white/80`
      case 'success':
        return `${baseClasses} bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500`
      case 'orange':
        return `${baseClasses} bg-orange-400/10 text-orange-400`
      default:
        return baseClasses
    }
  }
}
