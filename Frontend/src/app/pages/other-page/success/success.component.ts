import { Component } from '@angular/core';
import { GridShapeComponent } from '../../../shared/components/common/grid-shape/grid-shape.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-success',
  imports: [
    GridShapeComponent,
    RouterModule,
  ],
  templateUrl: './success.component.html',
  styles: ``
})
export class SuccessComponent {

  currentYear = new Date().getFullYear()
}
