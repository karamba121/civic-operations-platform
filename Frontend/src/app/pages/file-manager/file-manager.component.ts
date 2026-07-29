import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { AllMediaCardComponent } from '../../shared/components/file-manager/all-media-card/all-media-card.component';
import { AllFoldersComponent } from '../../shared/components/file-manager/all-folders/all-folders.component';
import { StorageDetailsChartComponent } from '../../shared/components/file-manager/storage-details-chart/storage-details-chart.component';
import { RecentFileTableComponent } from '../../shared/components/file-manager/recent-file-table/recent-file-table.component';

@Component({
  selector: 'app-file-manager',
  imports: [
    PageBreadcrumbComponent,
    AllMediaCardComponent,
    AllFoldersComponent,
    StorageDetailsChartComponent,
    RecentFileTableComponent,
  ],
  templateUrl: './file-manager.component.html',
  styles: ``
})
export class FileManagerComponent {

}
