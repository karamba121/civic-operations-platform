
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
  selector: 'app-top-channel',
  imports: [RouterModule, DropdownComponent, DropdownItemComponent],
  templateUrl: './top-channel.component.html'
})
export class TopChannelComponent {

  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  channels = [
    { name: 'Google', visitors: '4.7K' },
    { name: 'Facebook', visitors: '3.4K' },
    { name: 'Threads', visitors: '2.9K' },
    { name: 'Google', visitors: '1.5K' },
  ];
}
