import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputFieldComponent } from '../../input/input-field.component';
import { ButtonComponent } from '../../../ui/button/button.component';
import { ComponentCardComponent } from '../../../common/component-card/component-card.component';

@Component({
  selector: 'app-basic-form',
  imports: [
    FormsModule,
    InputFieldComponent,
    ButtonComponent,
    ComponentCardComponent,
  ],
  templateUrl: './basic-form.component.html',
  styles: ``
})
export class BasicFormComponent {

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  handleSubmit(event: Event) {
    event.preventDefault();
    console.log('Form submitted:', {
      name: this.name,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
    });
  }
}
