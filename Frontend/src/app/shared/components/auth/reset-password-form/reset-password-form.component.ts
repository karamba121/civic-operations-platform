import { Component } from '@angular/core';
import { LabelComponent } from '../../form/label/label.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password-form',
  imports: [
    LabelComponent,
    InputFieldComponent,
    RouterModule,
  ],
  templateUrl: './reset-password-form.component.html',
  styles: ``
})
export class ResetPasswordFormComponent {

}
