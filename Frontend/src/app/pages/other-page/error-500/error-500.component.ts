
import { Component } from '@angular/core';
import { GridShapeComponent } from '../../../shared/components/common/grid-shape/grid-shape.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-error-500',
  imports: [
    RouterModule,
    GridShapeComponent
],
  templateUrl: './error-500.component.html',
  styles: ``
})
export class Error500Component {

  currentYear = new Date().getFullYear()
}
