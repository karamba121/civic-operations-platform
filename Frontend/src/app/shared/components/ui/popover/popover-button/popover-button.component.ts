import { Component } from '@angular/core';
import { PopoverComponent } from '../popover/popover.component';
import { ButtonComponent } from '../../button/button.component';

@Component({
  selector: 'app-popover-button',
  imports: [
    PopoverComponent,
    ButtonComponent,
  ],
  templateUrl: './popover-button.component.html',
  styles: ``
})
export class PopoverButtonComponent {

}
