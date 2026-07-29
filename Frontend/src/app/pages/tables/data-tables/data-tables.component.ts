import { Component } from '@angular/core';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { DataTableOneComponent } from '../../../shared/components/tables/data-tables/table-one/data-table-one/data-table-one.component';
import { DataTableTwoComponent } from '../../../shared/components/tables/data-tables/table-two/data-table-two/data-table-two.component';
import { DataTableThreeComponent } from '../../../shared/components/tables/data-tables/table-three/data-table-three/data-table-three.component';

@Component({
  selector: 'app-data-tables',
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    DataTableOneComponent,
    DataTableTwoComponent,
    DataTableThreeComponent,
  ],
  templateUrl: './data-tables.component.html',
  styles: ``
})
export class DataTablesComponent {

}
