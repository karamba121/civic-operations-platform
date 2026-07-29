
import { Component } from '@angular/core';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';
import { BadgeComponent } from '../../ui/badge/badge.component';

interface Campaign {
  id: number;
  creator: {
    image: string;
    name: string;
  };
  campaign: {
    image: string;
    name: string;
    type: string;
  };
  status: 'Success' | 'Pending' | 'Failed';
}

@Component({
  selector: 'app-featured-campaign',
  imports: [
    DropdownComponent,
    DropdownItemComponent,
    BadgeComponent
],
  templateUrl: './featured-campaign.component.html',
  styles: ``
})
export class FeaturedCampaignComponent {

  isOpen = false;

  campaigns: Campaign[] = [
    {
      id: 1,
      creator: { image: '/images/user/user-01.jpg', name: 'Wilson Gouse' },
      campaign: { image: '/images/brand/brand-01.svg', name: 'Grow your brand by...', type: 'Ads campaign' },
      status: 'Success',
    },
    {
      id: 2,
      creator: { image: '/images/user/user-02.jpg', name: 'Wilson Gouse' },
      campaign: { image: '/images/brand/brand-02.svg', name: 'Make Better Ideas...', type: 'Ads campaign' },
      status: 'Pending',
    },
    {
      id: 3,
      creator: { image: '/images/user/user-03.jpg', name: 'Wilson Gouse' },
      campaign: { image: '/images/brand/brand-03.svg', name: 'Increase your website tra...', type: 'Ads campaign' },
      status: 'Success',
    },
    {
      id: 4,
      creator: { image: '/images/user/user-04.jpg', name: 'Wilson Gouse' },
      campaign: { image: '/images/brand/brand-04.svg', name: 'Grow your brand by...', type: 'Ads campaign' },
      status: 'Failed',
    },
    {
      id: 5,
      creator: { image: '/images/user/user-05.jpg', name: 'Wilson Gouse' },
      campaign: { image: '/images/brand/brand-05.svg', name: 'Grow your brand by...', type: 'Ads campaign' },
      status: 'Success',
    },
    {
      id: 6,
      creator: { image: '/images/user/user-06.jpg', name: 'Wilson Gouse' },
      campaign: { image: '/images/brand/brand-06.svg', name: 'Grow your brand by...', type: 'Ads campaign' },
      status: 'Success',
    },
  ];

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }

  getBadgeColor(status: string): 'success' | 'warning' | 'error' {
    if (status === 'Success') return 'success';
    if (status === 'Pending') return 'warning';
    return 'error';
  }
}
