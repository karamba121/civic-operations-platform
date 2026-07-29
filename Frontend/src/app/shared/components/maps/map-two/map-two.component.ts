import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map-two',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-two.component.html',
  styles: [':host { display: block; }']
})
export class MapTwoComponent {
}
