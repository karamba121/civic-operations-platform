import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { computePosition, flip, shift, offset, arrow } from '@floating-ui/dom';

@Directive({
  selector: '[data-tooltip]',
  standalone: true
})
export class TooltipDirective implements OnInit, OnDestroy {
  @Input('data-tooltip') content: string = '';
  @Input('data-tooltip-placement') placement: string = 'top';
  @Input('data-tooltip-variant') variant: string = 'default';

  private tooltipEl?: HTMLElement;
  private triggerEl: HTMLElement;

  private onMouseEnterBound = this.show.bind(this);
  private onMouseLeaveBound = this.hide.bind(this);
  private onClickBound = this.hide.bind(this);

  constructor(private el: ElementRef) {
    this.triggerEl = this.el.nativeElement;
  }

  ngOnInit() {
    this.triggerEl.addEventListener('mouseenter', this.onMouseEnterBound);
    this.triggerEl.addEventListener('mouseleave', this.onMouseLeaveBound);
    this.triggerEl.addEventListener('click', this.onClickBound);
  }

  ngOnDestroy() {
    this.triggerEl.removeEventListener('mouseenter', this.onMouseEnterBound);
    this.triggerEl.removeEventListener('mouseleave', this.onMouseLeaveBound);
    this.triggerEl.removeEventListener('click', this.onClickBound);
    this.hide();
  }

  private async show() {
    this.hide();
    
    // Read dynamic attributes
    const contentText = this.content || this.triggerEl.getAttribute('data-tooltip') || '';
    if (!contentText) return;

    const placementAttr = this.placement || this.triggerEl.getAttribute('data-tooltip-placement') || 'top';
    const variantAttr = this.variant || this.triggerEl.getAttribute('data-tooltip-variant') || 'default';

    // Create tooltip container
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.role = 'tooltip';

    // Same styling logic as tailadmin HTML version (tooltip.js)
    const variantClasses =
      variantAttr === "dark"
        ? "bg-gray-950 text-white border-gray-800 dark:bg-gray-800 dark:border-gray-700"
        : variantAttr === "plain"
          ? "bg-gray-800 text-white dark:bg-gray-900"
          : "bg-white text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-700";

    const borderClass =
      variantAttr === "plain" || variantAttr === "no-arrow" ? "" : "border";

    this.tooltipEl.className = `absolute z-99999 whitespace-nowrap rounded-lg ${borderClass} px-3.5 py-2 text-xs font-medium shadow-md ${variantClasses}`;
    
    // Set text content
    const textSpan = document.createElement('span');
    textSpan.textContent = contentText;
    this.tooltipEl.appendChild(textSpan);

    // Create arrow if not 'no-arrow' and not 'plain'
    let arrowEl: HTMLElement | undefined;
    const noArrow = variantAttr === "plain" || variantAttr === "no-arrow";
    
    if (!noArrow) {
      arrowEl = document.createElement('div');
      arrowEl.className = "tooltip-arrow absolute h-3 w-3";
      this.tooltipEl.appendChild(arrowEl);
    }

    document.body.appendChild(this.tooltipEl);

    // Compute Position using Floating UI
    const { x, y, placement, middlewareData } = await computePosition(this.triggerEl, this.tooltipEl, {
      placement: placementAttr as any,
      middleware: [
        offset(10), // matches offset in tooltip.js
        flip({
          fallbackAxisSideDirection: "start"
        }),
        shift({ padding: 8 }),
        ...(arrowEl ? [arrow({ element: arrowEl, padding: 8 })] : [])
      ]
    });

    if (this.tooltipEl) {
      this.tooltipEl.style.left = `${x}px`;
      this.tooltipEl.style.top = `${y}px`;
    }

    // Position arrow if present
    if (arrowEl && this.tooltipEl) {
      const side = placement.split('-')[0];
      const { x: arrowX, y: arrowY } = middlewareData.arrow || {};

      const arrowBg =
        variantAttr === "dark"
          ? "bg-gray-950 dark:bg-gray-800"
          : "bg-white dark:bg-gray-900";

      const arrowBorderClasses =
        variantAttr === "dark"
          ? "border-gray-800 dark:border-gray-700"
          : "border-gray-200 dark:border-gray-700";

      let arrowBorderSides = "";
      switch (side) {
        case "top":
          arrowBorderSides = "border-r border-b";
          break;
        case "bottom":
          arrowBorderSides = "border-l border-t";
          break;
        case "left":
          arrowBorderSides = "border-r border-t";
          break;
        case "right":
          arrowBorderSides = "border-l border-b";
          break;
      }

      arrowEl.className = `tooltip-arrow absolute h-3 w-3 rotate-45 ${arrowBg} ${arrowBorderSides} ${arrowBorderClasses}`;

      const arrowOffset = "-6px"; // Matches tooltip.js arrowOffset

      switch (side) {
        case "top":
          Object.assign(arrowEl.style, {
            bottom: arrowOffset,
            left: arrowX != null ? `${arrowX}px` : "50%",
            top: "",
            right: "",
          });
          break;
        case "bottom":
          Object.assign(arrowEl.style, {
            top: arrowOffset,
            left: arrowX != null ? `${arrowX}px` : "50%",
            bottom: "",
            right: "",
          });
          break;
        case "left":
          Object.assign(arrowEl.style, {
            right: arrowOffset,
            top: arrowY != null ? `${arrowY}px` : "50%",
            left: "",
            bottom: "",
          });
          break;
        case "right":
          Object.assign(arrowEl.style, {
            left: arrowOffset,
            top: arrowY != null ? `${arrowY}px` : "50%",
            right: "",
            bottom: "",
          });
          break;
      }
    }
  }

  private hide() {
    if (this.tooltipEl) {
      this.tooltipEl.remove();
      this.tooltipEl = undefined;
    }
  }
}
