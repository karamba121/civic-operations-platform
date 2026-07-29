import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-product-table',
  imports: [CommonModule],
  templateUrl: './top-product-table.component.html',
})
export class TopProductTableComponent {
  products = [
    {
      name: 'Classic Denim Jacket',
      meta: '3 Sizes',
      category: 'Jacket',
      sales: 500,
      earnings: '$89.99',
      stocks: 100,
      status: 'In Stock',
      img: 'images/product-01/product-01.jpg',
    },
    {
      name: 'Slim Fit Chinos',
      meta: '4 Colors',
      category: 'Pants',
      sales: 500,
      earnings: '$49.99',
      stocks: 80,
      status: 'In Stock',
      img: 'images/product-01/product-02.jpg',
    },
    {
      name: 'Organic Cotton T-Shirt',
      meta: '5 Colors',
      category: 'T-Shirt',
      sales: 220,
      earnings: '$25.00',
      stocks: 30,
      status: 'Low Stock',
      img: 'images/product-01/product-03.jpg',
    },
    {
      name: 'Leather Ankle Boots',
      meta: '6 Sizes',
      category: 'Footwear',
      sales: 875,
      earnings: '$120.00',
      stocks: 120,
      status: 'Low Stock',
      img: 'images/product-01/product-04.jpg',
    },
    {
      name: 'Classic Denim Jacket',
      meta: '3 Sizes',
      category: 'Jacket',
      sales: 500,
      earnings: '$89.99',
      stocks: 100,
      status: 'In Stock',
      img: 'images/product-01/product-05.jpg',
    },
  ];
}
