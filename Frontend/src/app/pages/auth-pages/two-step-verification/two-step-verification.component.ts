import { Component } from '@angular/core';
import { AuthPageLayoutComponent } from '../../../shared/layout/auth-page-layout/auth-page-layout.component';
import { OtpFormComponent } from '../../../shared/components/auth/otp-form/otp-form.component';

@Component({
  selector: 'app-two-step-verification',
  imports: [
    AuthPageLayoutComponent,
    OtpFormComponent,
  ],
  templateUrl: './two-step-verification.component.html',
  styles: ``
})
export class TwoStepVerificationComponent {

}
