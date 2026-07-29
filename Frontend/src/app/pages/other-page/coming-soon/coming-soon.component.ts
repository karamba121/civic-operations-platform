import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GridShapeComponent } from '../../../shared/components/common/grid-shape/grid-shape.component';
import { CountdownTimerComponent } from '../../../shared/components/common/countdown-timer/countdown-timer.component';

@Component({
  selector: 'app-coming-soon',
  imports: [
    RouterModule,
    FormsModule,
    GridShapeComponent,
    CountdownTimerComponent,
  ],
  templateUrl: './coming-soon.component.html',
  styles: ``
})
export class ComingSoonComponent {

  email = '';
  targetDate: Date = new Date();

  constructor() {
    this.targetDate.setDate(this.targetDate.getDate() + 29);
  }

  onSubmit() {
    // Handle the subscription logic here
    console.log('Email submitted:', this.email);
  }
}
