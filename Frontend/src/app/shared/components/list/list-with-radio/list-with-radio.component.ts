
import { Component } from '@angular/core';
import { RadioSmComponent } from '../../form/input/radio-sm.component';

@Component({
  selector: 'app-list-with-radio',
  imports: [
    RadioSmComponent
],
  templateUrl: './list-with-radio.component.html',
  styles: ``
})
export class ListWithRadioComponent {

  selectedValue = 'option1';

  handleChange(value: string) {
    this.selectedValue = value;
    console.log('Selected Value:', value);
  }

  items = [
    { id: 'option1', label: 'Lorem ipsum dolor sit amet' },
    { id: 'option2', label: 'It is a long established fact reader' },
    { id: 'option3', label: 'Lorem ipsum dolor sit amet' },
    { id: 'option4', label: 'Lorem ipsum dolor sit amet' },
    { id: 'option5', label: 'Lorem ipsum dolor sit amet' },
  ];
}
