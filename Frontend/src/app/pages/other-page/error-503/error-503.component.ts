import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { GridShapeComponent } from '../../../shared/components/common/grid-shape/grid-shape.component';

@Component({
  selector: 'app-error-503',
  imports: [
    RouterModule,
    GridShapeComponent,
  ],
  templateUrl: './error-503.component.html',
  styles: ``
})
export class Error503Component {
 currentYear = new Date().getFullYear()
}
