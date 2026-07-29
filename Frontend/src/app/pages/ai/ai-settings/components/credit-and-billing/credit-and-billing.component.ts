import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Invoice {
  id: string;
  amount: number;
  date: string;
}

@Component({
  selector: 'app-ai-settings-credit-and-billing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './credit-and-billing.component.html'
})
export class CreditAndBillingComponent {
  @Input() activeTab: string = 'account';

  remainingCredits: number = 50;

  invoices: Invoice[] = [
    { id: 'INV-2026-004', amount: 29, date: 'Nov 12, 2026' },
    { id: 'INV-2026-005', amount: 49, date: 'May 12, 2026' },
    { id: 'INV-2026-006', amount: 49, date: 'Feb 12, 2026' }
  ];

  upgrade() {
    alert('Upgrade flow triggered!');
  }

  updateCard() {
    alert('Payment details update requested.');
  }

  viewInvoice(invoiceId: string) {
    alert(`Viewing invoice details for: ${invoiceId}`);
  }
}
