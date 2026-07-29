import { Component } from '@angular/core';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { PriceTableOneComponent } from '../../shared/components/price-table/price-table-one/price-table-one.component';
import { PriceTableTwoComponent } from '../../shared/components/price-table/price-table-two/price-table-two.component';
import { PriceTableThreeComponent } from '../../shared/components/price-table/price-table-three/price-table-three.component';

@Component({
  selector: 'app-pricing-tables',
  imports: [
    ComponentCardComponent,
    PageBreadcrumbComponent,
    PriceTableOneComponent,
    PriceTableTwoComponent,
    PriceTableThreeComponent,
  ],
  templateUrl: './pricing-tables.component.html',
  styles: ``
})
export class PricingTablesComponent {

}
