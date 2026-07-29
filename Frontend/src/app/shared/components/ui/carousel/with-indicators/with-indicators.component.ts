
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-with-indicators',
  imports: [],
  templateUrl: './with-indicators.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``
})
export class WithIndicatorsComponent {

  carouselData = [
    {
      thumbnail: "/images/carousel/carousel-01.png",
    },
    {
      thumbnail: "/images/carousel/carousel-03.png",
    },
    {
      thumbnail: "/images/carousel/carousel-02.png",
    },
    {
      thumbnail: "/images/carousel/carousel-04.png",
    },
  ]
}
