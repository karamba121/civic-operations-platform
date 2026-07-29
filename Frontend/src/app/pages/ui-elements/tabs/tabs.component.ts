import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';
import { DefaultTabComponent } from '../../../shared/components/ui/tabs/default-tab/default-tab.component';
import { TabWithUnderlineComponent } from '../../../shared/components/ui/tabs/tab-with-underline/tab-with-underline.component';
import { TabWithBadgeComponent } from '../../../shared/components/ui/tabs/tab-with-badge/tab-with-badge.component';
import { TabWithUnderlineAndIconComponent } from '../../../shared/components/ui/tabs/tab-with-underline-and-icon/tab-with-underline-and-icon.component';
import { VerticalTabsComponent } from '../../../shared/components/ui/tabs/vertical-tabs/vertical-tabs.component';

@Component({
  selector: 'app-tabs',
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    DefaultTabComponent,
    TabWithUnderlineComponent,
    TabWithBadgeComponent,
    TabWithUnderlineAndIconComponent,
    VerticalTabsComponent,
  ],
  templateUrl: './tabs.component.html',
  styles: ``
})
export class TabsComponent {

}
