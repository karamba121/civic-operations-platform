import { Component } from '@angular/core';
import { NotificationComponent } from '../../../shared/components/ui/notification/notification/notification.component';
import { CookieConsentComponent } from '../../../shared/components/ui/notification/cookie-consent/cookie-consent.component';
import { UpdateNotificationComponent } from '../../../shared/components/ui/notification/update-notification/update-notification.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-notifications',
  imports: [
    NotificationComponent,
    CookieConsentComponent,
    UpdateNotificationComponent,
    ComponentCardComponent,
    PageBreadcrumbComponent,
  ],
  templateUrl: './notifications.component.html',
  styles: ``
})
export class NotificationsComponent {

  handleLater() {
    alert('Later button clicked');
  }

  handleUpdate() {
    alert('Update Now button clicked');
  }

  handleCookieSettings() {
    alert('Cookie Settings clicked');
  }

  handleDenyAll() {
    alert('Deny All clicked');
  }

  handleAcceptAll() {
    alert('Accept All clicked');
  }
}
