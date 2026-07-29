import { Component } from '@angular/core';
import { GeneratorLayoutComponent } from '../../../shared/layout/generator-layout/generator-layout.component';
import { ImageGeneratorContentComponent } from '../../../shared/components/ai/image-generator-content/image-generator-content.component';

@Component({
  selector: 'app-image-generator',
  imports: [
    GeneratorLayoutComponent,
    ImageGeneratorContentComponent
  ],
  templateUrl: './image-generator.component.html',
  styles: ``
})
export class ImageGeneratorComponent {

}
