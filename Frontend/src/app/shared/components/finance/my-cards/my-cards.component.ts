import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-my-cards',
  imports: [CommonModule],
  templateUrl: './my-cards.component.html',
  styleUrl: './my-cards.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MyCardsComponent {
  cards = [
    {
      name: 'Musharaf Chy',
      number: '•••• •••• •••• 4983',
      expiry: '09/29',
      cvc: '659',
      status: 'Active',
      logo: 'images/payment-gateway/mastercard.png',
    },
    {
      name: 'John Wick',
      number: '•••• •••• •••• 1234',
      expiry: '12/28',
      cvc: '123',
      status: 'Active',
      logo: 'images/payment-gateway/mastercard.png',
    },
    {
      name: 'Adward John',
      number: '•••• •••• •••• 5678',
      expiry: '10/27',
      cvc: '987',
      status: 'Inactive',
      logo: 'images/payment-gateway/mastercard.png',
    },
  ];

  transactions = [
    {
      title: 'Payment Received',
      desc: 'Cashback from Stellar Rewards',
      amount: '+$120.00',
      date: 'Mar 20',
      type: 'success',
      icon: 'images/payment-gateway/payment-1.svg',
      iconDark: 'images/payment-gateway/payment-1-dark.svg',
    },
    {
      title: 'Netflix Subscription',
      desc: 'September subscription charge',
      amount: '-$36.24',
      date: 'Sep 18',
      type: 'error',
      icon: 'images/payment-gateway/payment-2.svg',
    },
    {
      title: 'Money received',
      desc: 'Payment received via PayPal',
      amount: '+$590',
      date: 'Feb 12',
      type: 'success',
      icon: 'images/payment-gateway/payment-3.svg',
    },
    {
      title: 'Google Ads',
      desc: 'Payment received form google ads',
      amount: '+$236.24',
      date: 'Jan 28',
      type: 'success',
      icon: 'images/payment-gateway/payment-4.svg',
    },
    {
      title: 'Money received',
      desc: 'Payment received via PayPal',
      amount: '+$1,093',
      date: 'Jan 10',
      type: 'success',
      icon: 'images/payment-gateway/payment-3.svg',
    },
  ];
}
