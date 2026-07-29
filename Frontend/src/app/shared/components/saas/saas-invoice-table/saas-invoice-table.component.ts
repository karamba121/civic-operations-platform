
import { Component } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { BadgeComponent } from '../../ui/badge/badge.component';

interface Transaction {
  id: string;
  date: string;
  user: string;
  amount: string;
  status: 'Complete' | 'Pending' | 'Cancelled';
}

@Component({
  selector: 'app-saas-invoice-table',
  imports: [NgApexchartsModule, BadgeComponent],
  templateUrl: './saas-invoice-table.component.html',
})
export class SaasInvoiceTableComponent {
  transactions: Transaction[] = [
    {
      id: "#DF429",
      date: "April 28, 2016",
      user: "Jenny Wilson",
      amount: "$473.85",
      status: "Complete",
    },
    {
      id: "#HTY274",
      date: "October 30, 2017",
      user: "Wade Warren",
      amount: "$293.01",
      status: "Complete",
    },
    {
      id: "#LKE600",
      date: "May 29, 2017",
      user: "Darlene Robertson",
      amount: "$782.01",
      status: "Pending",
    },
    {
      id: "#HRP447",
      date: "May 20, 2015",
      user: "Arlene McCoy",
      amount: "$202.87",
      status: "Cancelled",
    },
    {
      id: "#WRH647",
      date: "March 13, 2014",
      user: "Bessie Cooper",
      amount: "$490.51",
      status: "Complete",
    },
  ];

  getBadgeClass(status: string) {
    if (status === 'Complete') return 'success';
    if (status === 'Pending') return 'warning';
    return 'error';
  }
}