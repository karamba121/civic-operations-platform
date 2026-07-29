
import { Component } from '@angular/core';
import { StockCardComponent } from '../stock-card/stock-card.component';

interface StockCardProps {
  imgUrl: string;
  symbol: string;
  companyName: string;
  price: string;
  change: string;
  changeDirection: 'up' | 'down';
}

@Component({
  selector: 'app-stock-metrics-list',
  imports: [
    StockCardComponent
],
  templateUrl: './stock-metrics-list.component.html'
})
export class StockMetricsListComponent {
  stockData: StockCardProps[] = [
    {
      imgUrl: '/images/brand/brand-07.svg',
      symbol: 'APPL',
      companyName: 'Apple, Inc',
      price: '$1,232.00',
      change: '11.01%',
      changeDirection: 'up',
    },
    {
      imgUrl: '/images/brand/brand-08.svg',
      symbol: 'PYPL',
      companyName: 'Paypal, Inc',
      price: '$965.00',
      change: '9.05%',
      changeDirection: 'down',
    },
    {
      imgUrl: '/images/brand/brand-09.svg',
      symbol: 'TSLA',
      companyName: 'Tesla, Inc',
      price: '$1,232.00',
      change: '11.01%',
      changeDirection: 'up',
    },
    {
      imgUrl: '/images/brand/brand-10.svg',
      symbol: 'AMZN',
      companyName: 'Amazon.com, Inc',
      price: '$2,567.00',
      change: '11.01%',
      changeDirection: 'up',
    },
  ];
}