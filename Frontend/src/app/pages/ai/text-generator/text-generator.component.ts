import { Component } from '@angular/core';
import { GeneratorLayoutComponent } from '../../../shared/layout/generator-layout/generator-layout.component';
import { TextGeneratorContentComponent } from '../../../shared/components/ai/text-generator-content/text-generator-content.component';

@Component({
  selector: 'app-text-generator',
  imports: [
    GeneratorLayoutComponent,
    TextGeneratorContentComponent,
  ],
  templateUrl: './text-generator.component.html',
  styles: ``,
})
export class TextGeneratorComponent {

}
