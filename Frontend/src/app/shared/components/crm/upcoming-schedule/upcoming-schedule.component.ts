// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-upcoming-schedule',
//   imports: [],
//   templateUrl: './upcoming-schedule.component.html',
//   styles: ``
// })
// export class UpcomingScheduleComponent {

// }



import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';

interface ScheduleItem {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-upcoming-schedule',
  imports: [
    CheckboxComponent,
    DropdownComponent,
    DropdownItemComponent
],
  templateUrl: './upcoming-schedule.component.html'
})
export class UpcomingScheduleComponent {
  isOpen = false;

  schedule: ScheduleItem[] = [
    {
      id: 'wed-11-jan',
      date: 'Wed, 11 Jan',
      time: '09:20 AM',
      title: 'Business Analytics Press',
      description: 'Exploring the Future of Data-Driven +6 more'
    },
    {
      id: 'fri-15-feb',
      date: 'Fri, 15 Feb',
      time: '10:35 AM',
      title: 'Business Sprint',
      description: 'Techniques from Business Sprint +2 more'
    },
    {
      id: 'thu-18-mar',
      date: 'Thu, 18 Mar',
      time: '1:15 AM',
      title: 'Customer Review Meeting',
      description: 'Insights from the Customer Review Meeting +8 more'
    }
  ];

  checkedItems: { [key: string]: boolean } = {
    'wed-11-jan': false,
    'fri-15-feb': false,
    'thu-18-mar': false
  };

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  handleCheckboxChange(id: string) {
    this.checkedItems[id] = !this.checkedItems[id];
  }
}