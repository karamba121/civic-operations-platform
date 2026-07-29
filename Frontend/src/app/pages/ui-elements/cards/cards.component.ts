import { Component } from '@angular/core';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { CardWithImageComponent } from '../../../shared/components/cards/card-with-image/card-with-image/card-with-image.component';
import { HorizontalCardWithImageComponent } from '../../../shared/components/cards/horizontal-card/horizontal-card-with-image/horizontal-card-with-image.component';
import { CardWithLinkExampleComponent } from '../../../shared/components/cards/card-with-link/card-with-link-example/card-with-link-example.component';
import { CardWithIconExampleComponent } from '../../../shared/components/cards/card-with-icon/card-with-icon-example/card-with-icon-example.component';

@Component({
  selector: 'app-cards',
  imports: [
    PageBreadcrumbComponent,
    CardWithImageComponent,
    HorizontalCardWithImageComponent,
    CardWithLinkExampleComponent,
    CardWithIconExampleComponent,
  ],
  templateUrl: './cards.component.html',
  styles: ``
})
export class CardsComponent {

}
