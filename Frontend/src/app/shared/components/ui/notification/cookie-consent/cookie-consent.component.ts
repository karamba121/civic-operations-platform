
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-cookie-consent',
  imports: [],
  templateUrl: './cookie-consent.component.html',
  styles: ``
})
export class CookieConsentComponent {

  @Input() message!: string;
  @Output() cookieSettings = new EventEmitter<void>();
  @Output() denyAll = new EventEmitter<void>();
  @Output() acceptAll = new EventEmitter<void>();

  isVisible = true;

  handleClose() {
    this.isVisible = false;
  }

  onCookieSettings() {
    this.cookieSettings.emit();
  }

  onDenyAll() {
    this.denyAll.emit();
    this.handleClose();
  }

  onAcceptAll() {
    this.acceptAll.emit();
    this.handleClose();
  }
}
