import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import flatpickr from 'flatpickr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-date-picker-two',
  imports: [CommonModule],
  templateUrl: './date-picker-two.component.html',
  styles: ``
})
export class DatePickerTwoComponent implements AfterViewInit, OnDestroy {

  @Input() id!: string;
  @Input() mode: 'single' | 'multiple' | 'range' | 'time' = 'single';
  @Input() defaultDate?: string | Date | string[] | Date[];
  @Input() placeholder?: string;
  @Input() dateFormat: string = 'Y-m-d';
  @Output() dateChange = new EventEmitter<any>();

  @ViewChild('dateInput', { static: false }) dateInput!: ElementRef<HTMLInputElement>;

  private flatpickrInstance: flatpickr.Instance | undefined;

  ngAfterViewInit() {
    this.flatpickrInstance = flatpickr(this.dateInput.nativeElement, {
      mode: this.mode,
      static: true,
      monthSelectorType: 'static',
      dateFormat: this.dateFormat,
      defaultDate: this.defaultDate,
      prevArrow:
        '<svg class="stroke-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.25 6L9 12.25L15.25 18.5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      nextArrow:
        '<svg class="stroke-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.75 19L15 12.75L8.75 6.5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      onReady: (selectedDates, dateStr, instance) => {
        if (this.mode === 'range') {
          (instance.element as HTMLInputElement).value = dateStr.replace(' to ', ' - ');
        }
        const customClass = instance.element.getAttribute('data-class');
        if (customClass && instance.calendarContainer) {
          instance.calendarContainer.classList.add(customClass);
        }
      },
      onChange: (selectedDates, dateStr, instance) => {
        if (this.mode === 'range') {
          (instance.element as HTMLInputElement).value = dateStr.replace(' to ', ' - ');
        }
        this.dateChange.emit({ selectedDates, dateStr, instance });
      }
    });

    if (this.mode === 'range' && this.flatpickrInstance) {
        this.flatpickrInstance.set('locale', {
            rangeSeparator: ' - '
        });
    }
  }

  ngOnDestroy() {
    if (this.flatpickrInstance) {
      this.flatpickrInstance.destroy();
    }
  }
}
