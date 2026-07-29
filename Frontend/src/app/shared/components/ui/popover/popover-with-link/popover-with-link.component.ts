import { Component } from '@angular/core';
import { PopoverComponent } from '../popover/popover.component';
import { ButtonComponent } from '../../button/button.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-popover-with-link',
  imports: [
    PopoverComponent,
    ButtonComponent,
    RouterModule,
  ],
  templateUrl: './popover-with-link.component.html',
  styles: ``
})
export class PopoverWithLinkComponent {

}
