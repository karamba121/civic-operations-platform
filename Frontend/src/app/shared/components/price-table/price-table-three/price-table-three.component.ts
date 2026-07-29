
import { Component } from '@angular/core';

@Component({
  selector: 'app-price-table-three',
  imports: [],
  templateUrl: './price-table-three.component.html',
  styles: ``
})
export class PriceTableThreeComponent {

  personalPack = [
    { text: 'Unlimited Projects' },
    { text: 'Share with 5 team members' },
    { text: 'Sync across devices' },
  ];

  professionalPack = [
    { text: 'Unlimited Projects' },
    { text: 'Share with 5 team members' },
    { text: 'Sync across devices' },
    { text: '30 days version history' },
  ];

  teamPack = [
    { text: 'Unlimited Projects' },
    { text: 'Share with 5 team members' },
    { text: 'Sync across devices' },
    { text: 'Sharing permissions' },
    { text: 'Admin tools' },
  ];

  enterprisePack = [
    { text: 'Unlimited Projects' },
    { text: 'Share with 5 team members' },
    { text: 'Sync across devices' },
    { text: 'Sharing permissions' },
    { text: 'User provisioning (SCIM)' },
    { text: 'Advanced security' },
  ];
}
