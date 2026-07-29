
import { Component } from '@angular/core';

@Component({
  selector: 'app-card-title',
  imports: [],
  template: `
    <h4 class="mb-1 font-medium text-gray-800 text-theme-xl dark:text-white/90">
      <ng-content></ng-content>
    </h4>
  `,
  styles: ``
})
export class CardTitleComponent {

}
