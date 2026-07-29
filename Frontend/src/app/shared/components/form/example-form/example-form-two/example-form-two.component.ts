import { Component } from '@angular/core';
import { ComponentCardComponent } from '../../../common/component-card/component-card.component';
import { LabelComponent } from '../../label/label.component';
import { InputFieldComponent } from '../../input/input-field.component';
import { SelectComponent } from '../../select/select.component';
import { RadioComponent } from '../../input/radio.component';
import { ButtonComponent } from '../../../ui/button/button.component';
import { DatePickerComponent } from '../../date-picker/date-picker.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-example-form-two',
  imports: [
    FormsModule,
    ComponentCardComponent,
    LabelComponent,
    InputFieldComponent,
    SelectComponent,
    RadioComponent,
    ButtonComponent,
    DatePickerComponent,
  ],
  templateUrl: './example-form-two.component.html',
  styles: ``
})
export class ExampleFormTwoComponent {

  firstName = '';
  lastName = '';
  gender = '';
  dob: string = '';
  category = '';
  street = '';
  city = '';
  state = '';
  postCode = '';
  country = '';
  membership: string = 'Free';

  optionsGender = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Others' },
  ];

  categoryOptions = [
    { value: 'cate1', label: 'Category 1' },
    { value: 'cate2', label: 'Category 2' },
    { value: 'cate3', label: 'Category 3' },
  ];

  countryOptions = [
    { value: 'bd', label: 'Bangladesh' },
    { value: 'usa', label: 'United States' },
    { value: 'canada', label: 'Canada' },
  ];

  handleSubmit(event: Event) {
    event.preventDefault();
    console.log('Form submitted:');
  }

  handleSelectGender(value: string) {
    this.gender = value;
    console.log('Selected value:', value);
  }

  handleCategoryChange(value: string) {
    this.category = value;
    console.log('Selected category:', value);
  }

  handleCountryChange(value: string) {
    this.country = value;
    console.log('Selected country:', value);
  }

  handleRadioChange(value: string) {
    this.membership = value;
    console.log('Selected:', value);
  }

  handleDateChange(date: string) {
    this.dob = date;
    console.log('Date of Birth:', date);
  }
}
