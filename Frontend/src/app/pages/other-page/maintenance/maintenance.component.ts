import { Component } from '@angular/core';
import { GridShapeComponent } from '../../../shared/components/common/grid-shape/grid-shape.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-maintenance',
  imports: [
    GridShapeComponent,
    RouterModule,
  ],
  templateUrl: './maintenance.component.html',
  styles: ``
})
export class MaintenanceComponent {

  currentYear = new Date().getFullYear();
}
