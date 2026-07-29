
import { Component} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgOtpInputConfig, NgOtpInputModule } from 'ng-otp-input';
import { LabelComponent } from '../../form/label/label.component';

@Component({
  selector: 'app-otp-form',
  imports: [
    RouterModule,
    FormsModule,
    LabelComponent,
    NgOtpInputModule
],
  templateUrl: './otp-form.component.html',
  styles: ``
})
export class OtpFormComponent {

  onOtpChange (event:string){

  }

  config :NgOtpInputConfig = {
    length:6,
    inputClass:"dark:bg-dark-900 otp-input !h-11 !w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-center text-xl !font-semibold !text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
  };

  handleSubmit() {
    alert(`Submitted OTP:`);
  }

}
