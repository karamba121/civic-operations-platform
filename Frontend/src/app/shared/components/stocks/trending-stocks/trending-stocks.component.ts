
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import Swiper from 'swiper';

@Component({
  selector: 'app-trending-stocks',
  imports: [],
  templateUrl: './trending-stocks.component.html',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class TrendingStocksComponent {

  @ViewChild('swiperRef') swiperRef!: ElementRef;
  public swiperInstance: Swiper | undefined;
  
  public stocks = [
    {
      img: '/images/brand/brand-09.svg',
      symbol: 'TSLA',
      name: 'Tesla, Inc',
      price: '$192.53',
      change: '1.01%',
      changeClass: 'text-success-600 dark:text-success-500'
    },
    {
      img: '/images/brand/brand-07.svg',
      symbol: 'AAPL',
      name: 'Apple, Inc',
      price: '$192.53',
      change: '3.59%',
      changeClass: 'text-success-600 dark:text-success-500'
    },
    {
      img: '/images/brand/brand-11.svg',
      symbol: 'SPOT',
      name: 'Spotify, Inc',
      price: '$192.53',
      change: '1.01%',
      changeClass: 'text-success-600 dark:text-success-500'
    },
    {
      img: '/images/brand/brand-08.svg',
      symbol: 'PYPL',
      name: 'Paypal, Inc',
      price: '$192.53',
      change: '1.01%',
      changeClass: 'text-success-600 dark:text-success-500'
    },
    {
      img: '/images/brand/brand-10.svg',
      symbol: 'AMZN',
      name: 'Amazone, Inc',
      price: '$192.53',
      change: '1.01%',
      changeClass: 'text-success-600 dark:text-success-500'
    }
  ];
}
