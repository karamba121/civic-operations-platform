import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';


interface WatchlistItem {
  symbol: string;
  companyName: string;
  price: string;
  change: string;
  changeDirection: 'up' | 'down';
  brandImage: string;
}

@Component({
  selector: 'app-watch-list',
  imports: [
    CommonModule,
    DropdownComponent,
    DropdownItemComponent
  ],
  templateUrl: './watch-list.component.html',
  styles: ``
})

export class WatchListComponent {

  isOpen = false;

  watchlistData: WatchlistItem[] = [
    {
      symbol: "AAPL",
      companyName: "Apple, Inc",
      price: "$4,008.65",
      change: "11.01%",
      changeDirection: "up",
      brandImage: "/images/brand/brand-07.svg",
    },
    {
      symbol: "SPOT",
      companyName: "Spotify.com",
      price: "$11,689.00",
      change: "9.48%",
      changeDirection: "up",
      brandImage: "/images/brand/brand-11.svg",
    },
    {
      symbol: "ABNB",
      companyName: "Airbnb, Inc",
      price: "$32,227.00",
      change: "0.29%",
      changeDirection: "down",
      brandImage: "/images/brand/brand-12.svg",
    },
    {
      symbol: "ENVT",
      companyName: "Envato, Inc",
      price: "$13,895.00",
      change: "3.79%",
      changeDirection: "up",
      brandImage: "/images/brand/brand-13.svg",
    },
    {
      symbol: "QIWI",
      companyName: "qiwi.com, Inc",
      price: "$4,008.65",
      change: "4.52%",
      changeDirection: "down",
      brandImage: "/images/brand/brand-14.svg",
    },
    {
      symbol: "APPL",
      companyName: "Apple, Inc",
      price: "$4,523.00",
      change: "3.12%",
      changeDirection: "up",
      brandImage: "/images/brand/brand-07.svg",
    },
    {
      symbol: "SPOT",
      companyName: "Spotify.com",
      price: "$11,689.00",
      change: "9.48%",
      changeDirection: "up",
      brandImage: "/images/brand/brand-11.svg",
    },
    {
      symbol: "ABNB",
      companyName: "Airbnb, Inc",
      price: "$32,227.00",
      change: "0.29%",
      changeDirection: "down",
      brandImage: "/images/brand/brand-12.svg",
    },
  ];

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  getBadgeColor(direction: string): 'success' | 'error' | 'warning' {
    if (direction === 'up') return 'success';
    if (direction === 'down') return 'error';
    return 'warning';
  }
}
