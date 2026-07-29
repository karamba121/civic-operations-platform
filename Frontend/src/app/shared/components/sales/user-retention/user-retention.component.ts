import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { ThemeService } from '../../../services/theme.service';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';

interface TooltipState {
  col: number;
  value: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-user-retention',
  imports: [CommonModule, DropdownComponent, DropdownItemComponent],
  templateUrl: './user-retention.component.html',
  styleUrl: './user-retention.component.css',
})
export class UserRetentionComponent {
  @ViewChild('wrapperRef') wrapperRef!: ElementRef<HTMLElement>;

  COLS = 12;
  ROWS = 12;
  BASE = [84, 61, 52, 45, 40, 37, 34, 31, 29, 27, 25, 23];
  OFFSETS = [0, 4, -3, 6, -2, 3, -5, 7, -1, 5, -3, 2];

  matrix: number[][] = [];
  colLabels = Array.from({ length: 12 }, (_, i) => i + 1);
  tooltip: TooltipState | null = null;
  openDropdown: string | null = null;

  constructor(public themeService: ThemeService) {
    this.generateMatrix();
  }

  generateMatrix() {
    const result: number[][] = [];
    for (let s = 0; s < this.ROWS; s++) {
      const numPeriods = s + 1;
      const row: number[] = [];
      for (let col = 0; col < this.COLS; col++) {
        row.push(
          col < numPeriods
            ? Math.min(100, Math.max(1, this.BASE[col] + this.OFFSETS[s]))
            : 0
        );
      }
      result.push(row);
    }
    // Reverse so the fullest row (12 active cells) is at top
    this.matrix = result.slice().reverse();
  }

  getCellColor(value: number): string {
    if (value === 0) return 'transparent';
    if (value <= 25) return '#DDE9FF';
    if (value <= 50) return '#9CB9FF';
    if (value <= 75) return '#7592FF';
    return '#465FFF';
  }

  handleMouseEnter(event: MouseEvent, value: number, col: number) {
    if (value === 0) return;
    const cell = event.currentTarget as HTMLElement;
    const rect = cell.getBoundingClientRect();
    const wRect = this.wrapperRef.nativeElement.getBoundingClientRect();
    
    this.tooltip = {
      col,
      value,
      x: rect.left - wRect.left + rect.width / 2,
      y: rect.top - wRect.top,
    };
  }

  handleMouseLeave() {
    this.tooltip = null;
  }

  toggleDropdown(key: string) {
    this.openDropdown = this.openDropdown === key ? null : key;
  }

  closeDropdown() {
    this.openDropdown = null;
  }
}
