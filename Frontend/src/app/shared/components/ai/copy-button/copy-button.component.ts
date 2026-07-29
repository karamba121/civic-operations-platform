
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-copy-button',
  imports: [],
  template: `
    <button
      (click)="handleCopy()"
      class="flex h-8 items-center gap-1 rounded-full border border-gray-100 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-500 dark:border-white/5 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-white/90"
      type="button"
    >
      @if (copied) {
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M16.6663 5L7.49967 14.1667L3.33301 10"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      } @else {
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M14.1567 14.1628H7.08803C6.39768 14.1628 5.83803 13.6031 5.83803 12.9128V5.8441M14.1567 14.1628L14.1567 15.416C14.1567 16.1064 13.5971 16.666 12.9067 16.666H4.58478C3.89442 16.666 3.33478 16.1064 3.33478 15.416V7.0941C3.33478 6.40374 3.89442 5.8441 4.58478 5.8441H5.83803M14.1567 14.1628H15.4152C16.1056 14.1628 16.6652 13.6031 16.6652 12.9128L16.6652 4.58392C16.6652 3.89357 16.1056 3.33392 15.4152 3.33392H7.08803C6.39768 3.33392 5.83803 3.89357 5.83803 4.58392V5.8441"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      }
      <span>{{ copied ? 'Copied' : 'Copy' }}</span>
    </button>
  `,
  styles: ``,
})
export class CopyButtonComponent {
  @Input() textToCopy!: string;

  copied = false;
  private timeoutId?: any;

  async handleCopy() {
    try {
      await navigator.clipboard.writeText(this.textToCopy);
      this.copied = true;
      clearTimeout(this.timeoutId);
      this.timeoutId = setTimeout(() => (this.copied = false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }
}
