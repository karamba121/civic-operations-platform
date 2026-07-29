import { Component } from '@angular/core';
import { ComponentCardComponent } from '../../../common/component-card/component-card.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-link-opacity-hover',
  imports: [
    ComponentCardComponent,
    RouterModule,
  ],
  templateUrl: './link-opacity-hover.component.html',
  styles: ``
})
export class LinkOpacityHoverComponent {

}
