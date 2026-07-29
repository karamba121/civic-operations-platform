import { Component } from '@angular/core';
import { PopoverComponent } from '../popover/popover.component';
import { ButtonComponent } from '../../button/button.component';

@Component({
  selector: 'app-default-popover',
  imports: [
    PopoverComponent,
    ButtonComponent,
  ],
  templateUrl: './default-popover.component.html',
  styles: ``
})
export class DefaultPopoverComponent {

}
