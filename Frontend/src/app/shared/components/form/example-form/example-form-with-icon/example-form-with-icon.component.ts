import { Component } from '@angular/core';
import { ComponentCardComponent } from '../../../common/component-card/component-card.component';
import { InputFieldComponent } from '../../input/input-field.component';
import { ButtonComponent } from '../../../ui/button/button.component';
import { CheckboxComponent } from '../../input/checkbox.component';
import { FormsModule } from '@angular/forms';
import { LabelComponent } from '../../label/label.component';

@Component({
  selector: 'app-example-form-with-icon',
  imports: [
    ComponentCardComponent,
    InputFieldComponent,
    ButtonComponent,
    CheckboxComponent,
    FormsModule,
    LabelComponent,
  ],
  templateUrl: './example-form-with-icon.component.html',
  styles: ``
})
export class ExampleFormWithIconComponent {

  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  isChecked = false;

  handleSubmit(event: Event) {
    event.preventDefault();
    console.log('Form submitted:');
  }
}
