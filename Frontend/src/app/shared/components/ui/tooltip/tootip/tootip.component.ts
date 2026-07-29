
import { Component, ElementRef, HostListener, Input, OnDestroy, ViewChild } from '@angular/core';

import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  offset,
  Placement,
  shift,
} from '@floating-ui/dom';

type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';
type TooltipVariant = 'default' | 'dark';

@Component({
  selector: 'app-tooltip',
  imports: [],
  templateUrl: './tootip.component.html',
  styles: [`
    :host {
      display: inline-flex;
    }
  `]
})
export class TooltipComponent implements OnDestroy {
  @Input() content: string = '';
  @Input() placement: TooltipPlacement = 'top';
  @Input() variant: TooltipVariant = 'default';
  
  @ViewChild('triggerRef') triggerRef!: ElementRef;
  @ViewChild('floatingRef') floatingRef!: ElementRef;
  @ViewChild('arrowRef') arrowRef!: ElementRef;

  isOpen = false;
  floatingStyles = { top: 0, left: 0 };
  arrowStyles: any = {};
  arrowBorderSides = '';
  
  private cleanup?: () => void;
  private openTimeout?: any;
  private closeTimeout?: any;

  private placementMap: Record<TooltipPlacement, Placement> = {
    top: 'top',
    right: 'right',
    bottom: 'bottom',
    left: 'left',
  };

  get variantClasses(): string {
    return this.variant === 'dark'
      ? 'bg-gray-950 text-white border border-gray-800 dark:bg-gray-800 dark:border-gray-700'
      : 'bg-white text-gray-700 border border-gray-200 dark:bg-[#1E2634] dark:text-white dark:border-gray-700';
  }

  get arrowBg(): string {
    return this.variant === 'dark'
      ? 'bg-gray-950 dark:bg-gray-800'
      : 'bg-white dark:bg-[#1E2634]';
  }

  get arrowBorderClasses(): string {
    return this.variant === 'dark'
      ? 'border-gray-800 dark:border-gray-700'
      : 'border-gray-200 dark:border-gray-700';
  }

  onMouseEnter() {
    this.clearCloseTimeout();
    this.openTimeout = setTimeout(() => {
      this.show();
    }, 100);
  }

  onMouseLeave() {
    this.clearOpenTimeout();
    this.hide();
  }

  onFocus() {
    this.show();
  }

  onBlur() {
    this.hide();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.hide();
  }

  private show() {
    this.isOpen = true;
    setTimeout(() => this.updatePosition(), 0);
  }

  private hide() {
    this.isOpen = false;
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = undefined;
    }
  }

  private clearOpenTimeout() {
    if (this.openTimeout) {
      clearTimeout(this.openTimeout);
      this.openTimeout = undefined;
    }
  }

  private clearCloseTimeout() {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = undefined;
    }
  }

  private async updatePosition() {
    if (!this.triggerRef || !this.floatingRef || !this.arrowRef) return;

    const triggerEl = this.triggerRef.nativeElement;
    const floatingEl = this.floatingRef.nativeElement;
    const arrowEl = this.arrowRef.nativeElement;

    this.cleanup = autoUpdate(triggerEl, floatingEl, async () => {
      const { x, y, placement, middlewareData } = await computePosition(
        triggerEl,
        floatingEl,
        {
          placement: this.placementMap[this.placement],
          middleware: [
            offset(10),
            flip({
              fallbackAxisSideDirection: 'start',
            }),
            shift({ padding: 8 }),
            arrow({
              element: arrowEl,
              padding: 8,
            }),
          ],
        }
      );

      this.floatingStyles = { top: y, left: x };

      // Update arrow position
      const arrowX = middlewareData.arrow?.x;
      const arrowY = middlewareData.arrow?.y;
      const side = placement.split('-')[0];

      this.arrowStyles = this.getArrowStyles(side, arrowX, arrowY);
      this.arrowBorderSides = this.getArrowBorderSides(side);
    });
  }

  private getArrowStyles(side: string, arrowX?: number, arrowY?: number): any {
    switch (side) {
      case 'top':
        return {
          bottom: '-6px',
          left: arrowX != null ? `${arrowX}px` : '50%',
        };
      case 'bottom':
        return {
          top: '-6px',
          left: arrowX != null ? `${arrowX}px` : '50%',
        };
      case 'left':
        return {
          right: '-6px',
          top: arrowY != null ? `${arrowY}px` : '50%',
        };
      case 'right':
        return {
          left: '-6px',
          top: arrowY != null ? `${arrowY}px` : '50%',
        };
      default:
        return {};
    }
  }

  private getArrowBorderSides(side: string): string {
    switch (side) {
      case 'top':
        return 'border-r border-b';
      case 'bottom':
        return 'border-l border-t';
      case 'left':
        return 'border-r border-t';
      case 'right':
        return 'border-l border-b';
      default:
        return '';
    }
  }

  ngOnDestroy() {
    if (this.cleanup) {
      this.cleanup();
    }
    this.clearOpenTimeout();
    this.clearCloseTimeout();
  }
}