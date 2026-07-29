import { Component } from '@angular/core';
import { ComponentCardComponent } from '../../../common/component-card/component-card.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-default-link-example',
  imports: [
    ComponentCardComponent,
    RouterModule,
  ],
  templateUrl: './default-link-example.component.html',
  styles: ``
})
export class DefaultLinkExampleComponent {

}
