import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EmailHeaderComponent } from '../email-header/email-header.component';
import { EmailPaginationComponent } from '../email-pagination/email-pagination.component';
import { CheckboxComponent } from '../../../form/input/checkbox.component';

interface Mail {
  subject: string;
  content: string;
  time: string;
  badge?: 'Important' | 'Social' | 'Promotional';
}


@Component({
  selector: 'app-email-content',
  imports: [
    CommonModule,
    EmailHeaderComponent,
    EmailPaginationComponent,
    CheckboxComponent,
  ],
  templateUrl: './email-content.component.html',
  styles: ``
})
export class EmailContentComponent {

  mailData: Mail[] = [
    {
      subject: "Material UI",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
      time: "12:16 pm",
      badge: "Important",
    },
    {
      subject: "Wise",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
      time: "12:16 pm",
    },
    {
      subject: "Search Console",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
      time: "Apr, 24",
      badge: "Social",
    },
    {
      subject: "Paypal",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
      time: "Apr, 30",
    },
    {
      subject: "Google Meet",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
      time: "Apr, 16",
    },
    {
      subject: "Loom",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
      time: "Apr, 24",
    },
    {
      subject: "Airbnb",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
      time: "Mar, 05",
    },
    {
      subject: "Facebook",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
      time: "Feb, 25",
    },
    {
      subject: "Instagram",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
      time: "Feb, 20",
      badge: "Promotional",
    },
    {
      subject: "Google",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
      time: "Feb, 25",
    },
    {
      subject: "FormBold",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
      time: "Jan, 22",
    },
    {
      subject: "GrayGrids",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
      time: "Feb, 25",
    },
    {
      subject: "UIdeck",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda dolor dolore esse modi nesciunt, nobis numquam sed sequi sunt totam!",
      time: "Feb, 15",
    },
  ];

  checkedItems: boolean[] = this.mailData.map(() => false);
  starredItems: boolean[] = this.mailData.map(() => false);

  toggleCheck(index: number, checked: boolean) {
    this.checkedItems[index] = checked;
  }

  toggleStar(index: number) {
    this.starredItems[index] = !this.starredItems[index];
  }

  handleSelectAll(checked: boolean) {
    this.checkedItems = this.mailData.map(() => checked);
  }

  get allChecked(): boolean {
    return this.checkedItems.every(Boolean);
  }
}
