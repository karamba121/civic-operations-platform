
import { Component } from '@angular/core';
import { CheckboxComponent } from '../../form/input/checkbox.component';

@Component({
  selector: 'app-list-with-checkbox',
  imports: [
    CheckboxComponent
],
  templateUrl: './list-with-checkbox.component.html',
  styles: ``
})
export class ListWithCheckboxComponent {

    items: string[] = [
    'Lorem ipsum dolor sit amet',
    'It is a long established fact reader',
    'Lorem ipsum dolor sit amet',
    'Lorem ipsum dolor sit amet',
    'Lorem ipsum dolor sit amet'
  ];

  checkedItems: boolean[] = Array(this.items.length).fill(false);

  handleCheckboxChange(index: number, value: boolean): void {
    this.checkedItems[index] = value;
  }
}
