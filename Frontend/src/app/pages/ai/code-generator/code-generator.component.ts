import { Component } from '@angular/core';
import { GeneratorLayoutComponent } from '../../../shared/layout/generator-layout/generator-layout.component';
import { CodeGeneratorContentComponent } from '../../../shared/components/ai/code-generator-content/code-generator-content.component';

@Component({
  selector: 'app-code-generator',
  imports: [
    GeneratorLayoutComponent,
    CodeGeneratorContentComponent,
  ],
  templateUrl: './code-generator.component.html',
  styles: ``
})
export class CodeGeneratorComponent {

}
