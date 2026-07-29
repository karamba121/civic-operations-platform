import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  selector: 'app-with-control',
  imports: [],
  templateUrl: './with-control.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: ``
})
export class WithControlComponent {

  carouselData = [
    {
      thumbnail: "/images/carousel/carousel-01.png",
    },
    {
      thumbnail: "/images/carousel/carousel-02.png",
    },
    {
      thumbnail: "/images/carousel/carousel-03.png",
    },
    {
      thumbnail: "/images/carousel/carousel-04.png",
    },
  ]
}
