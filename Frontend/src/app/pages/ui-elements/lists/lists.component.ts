
import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { HorizontalListComponent } from '../../../shared/components/list/horizontal-list/horizontal-list.component';
import { OrderedListComponent } from '../../../shared/components/list/ordered-list/ordered-list.component';
import { UnOrderedListComponent } from '../../../shared/components/list/un-ordered-list/un-ordered-list.component';
import { ListWithIconComponent } from '../../../shared/components/list/list-with-icon/list-with-icon.component';
import { ListWithCheckboxComponent } from '../../../shared/components/list/list-with-checkbox/list-with-checkbox.component';
import { ListWithRadioComponent } from '../../../shared/components/list/list-with-radio/list-with-radio.component';
import { ListWithButtonComponent } from '../../../shared/components/list/list-with-button/list-with-button.component';
import { ComponentCardComponent } from '../../../shared/components/common/component-card/component-card.component';

@Component({
  selector: 'app-lists',
  imports: [
    ComponentCardComponent,
    PageBreadcrumbComponent,
    HorizontalListComponent,
    OrderedListComponent,
    UnOrderedListComponent,
    ListWithIconComponent,
    ListWithCheckboxComponent,
    ListWithRadioComponent,
    ListWithButtonComponent
],
  templateUrl: './lists.component.html',
  styles: ``
})
export class ListsComponent {

}
