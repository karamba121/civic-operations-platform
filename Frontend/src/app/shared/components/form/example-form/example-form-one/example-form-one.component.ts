
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LabelComponent } from '../../label/label.component';
import { SelectComponent } from '../../select/select.component';
import { InputFieldComponent } from '../../input/input-field.component';
import { TextAreaComponent } from '../../input/text-area.component';
import { ButtonComponent } from '../../../ui/button/button.component';
import { ComponentCardComponent } from '../../../common/component-card/component-card.component';

@Component({
  selector: 'app-example-form-one',
  imports: [
    FormsModule,
    LabelComponent,
    SelectComponent,
    InputFieldComponent,
    TextAreaComponent,
    ButtonComponent,
    ComponentCardComponent
],
  templateUrl: './example-form-one.component.html',
  styles: ``
})
export class ExampleFormOneComponent {

  firstName = '';
  lastName = '';
  email = '';
  subject = '';
  message = '';

  options = [
    { value: 'marketing', label: 'Option 1' },
    { value: 'template', label: 'Option 2' },
    { value: 'development', label: 'Option 3' },
  ];

  handleSubmit(event: Event) {
    event.preventDefault();
    console.log('Form submitted:');
  }

  handleSelectChange(value: string) {
    this.subject = value;
    console.log('Selected value:', value);
  }

  handleTextareaChange(value: string | number) {
    this.message = value.toString();
    console.log('Message:', this.message);
  }
}
