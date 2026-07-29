import { Component } from '@angular/core';
import { DefaultLinkExampleComponent } from '../../../shared/components/ui/links/default-link-example/default-link-example.component';
import { LinkOpacityExampleComponent } from '../../../shared/components/ui/links/link-opacity-example/link-opacity-example.component';
import { LinkOpacityHoverComponent } from '../../../shared/components/ui/links/link-opacity-hover/link-opacity-hover.component';
import { ColoredLinkWithUnderlineComponent } from '../../../shared/components/ui/links/colored-link-with-underline/colored-link-with-underline.component';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';

@Component({
  selector: 'app-links',
  imports: [
    DefaultLinkExampleComponent,
    LinkOpacityExampleComponent,
    LinkOpacityHoverComponent,
    ColoredLinkWithUnderlineComponent,
    PageBreadcrumbComponent,
  ],
  templateUrl: './links.component.html',
  styles: ``
})
export class LinksComponent {

}
