import { Component, ElementRef, HostListener, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quick-send',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-send.component.html',
  styleUrl: './quick-send.component.css',
})
export class QuickSendComponent implements AfterViewInit {
  @ViewChild('avatarList') avatarList!: ElementRef<HTMLDivElement>;

  users = [
    { id: 17, image: 'images/user/user-17.jpg' },
    { id: 18, image: 'images/user/user-18.jpg' },
    { id: 19, image: 'images/user/user-19.jpg' },
    { id: 20, image: 'images/user/user-20.jpg' },
    { id: 21, image: 'images/user/user-21.jpg' },
    { id: 22, image: 'images/user/user-22.jpg' },
    { id: 23, image: 'images/user/user-23.jpg' },
    { id: 24, image: 'images/user/user-24.jpg' },
    { id: 25, image: 'images/user/user-25.jpg' },
    { id: 26, image: 'images/user/user-26.jpg' },
  ];

  cards = [
    'Visa •••• •••• 3657',
    'Master •••• •••• 4912',
  ];

  currencies = [
    { code: '$ USD', label: '$ USD' },
    { code: '€ EUR', label: '€ EUR' },
  ];

  selectedUserId = 17;
  selectedCard = this.cards[0];
  selectedCurrency = this.currencies[0].code;

  atStart = true;
  atEnd = false;

  openCardDropdown = false;
  openCurrencyDropdown = false;

  ngAfterViewInit() {
    this.checkScroll();
  }

  checkScroll() {
    if (!this.avatarList) return;
    const el = this.avatarList.nativeElement;
    this.atStart = el.scrollLeft <= 5;
    this.atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
  }

  scrollNext() {
    this.avatarList.nativeElement.scrollBy({ left: 120, behavior: 'smooth' });
    setTimeout(() => this.checkScroll(), 300); // Check after animation
  }

  scrollPrev() {
    this.avatarList.nativeElement.scrollBy({ left: -120, behavior: 'smooth' });
    setTimeout(() => this.checkScroll(), 300); // Check after animation
  }

  selectUser(id: number) {
    this.selectedUserId = id;
  }

  toggleCardDropdown() {
    this.openCardDropdown = !this.openCardDropdown;
    if (this.openCardDropdown) this.openCurrencyDropdown = false;
  }

  toggleCurrencyDropdown() {
    this.openCurrencyDropdown = !this.openCurrencyDropdown;
    if (this.openCurrencyDropdown) this.openCardDropdown = false;
  }

  selectCard(card: string) {
    this.selectedCard = card;
    this.openCardDropdown = false;
  }

  selectCurrency(currency: string) {
    this.selectedCurrency = currency;
    this.openCurrencyDropdown = false;
  }

  onSubmit(event: Event) {
    event.preventDefault();
    console.log('Sending money...', {
      user: this.selectedUserId,
      from: this.selectedCard,
      currency: this.selectedCurrency,
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    this.openCardDropdown = false;
    this.openCurrencyDropdown = false;
  }
}
