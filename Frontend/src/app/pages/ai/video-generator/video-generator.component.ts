import { Component } from '@angular/core';
import { GeneratorLayoutComponent } from '../../../shared/layout/generator-layout/generator-layout.component';
import { VideoGeneratorContentComponent } from '../../../shared/components/ai/video-generator-content/video-generator-content.component';

@Component({
  selector: 'app-video-generator',
  imports: [
    GeneratorLayoutComponent,
    VideoGeneratorContentComponent,
  ],
  templateUrl: './video-generator.component.html',
  styles: ``
})
export class VideoGeneratorComponent {

}
