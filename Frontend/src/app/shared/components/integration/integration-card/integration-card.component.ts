
import { Component, Input } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { SafeHtmlPipe } from '../../../pipe/safe-html.pipe';
import { IntegrationSettingsModalComponent } from '../integration-settings-modal/integration-settings-modal.component';
import { IntegrationDetailsModalComponent } from '../integration-details-modal/integration-details-modal.component';
import { IntegrationDeleteModalComponent } from '../integration-delete-modal/integration-delete-modal.component';
import { SwitchComponent } from '../../form/input/switch.component';

@Component({
  selector: 'app-integration-card',
  imports: [
    DropdownComponent,
    DropdownItemComponent,
    SafeHtmlPipe,
    IntegrationSettingsModalComponent,
    IntegrationDetailsModalComponent,
    IntegrationDeleteModalComponent,
    SwitchComponent
],
  templateUrl: './integration-card.component.html',
  styles: ``
})
export class IntegrationCardComponent {

  @Input() title!: string;
  @Input() icon!: string;
  @Input() description!: string;
  @Input() connect!: boolean;
  showDeleteModal = false;

  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  openDeleteModal() {
    this.showDeleteModal = true;
    this.closeDropdown();
  }

  deleteIntegration() {
    this.showDeleteModal = false;
    this.closeDropdown();
  }
}
