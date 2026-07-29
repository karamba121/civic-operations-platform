import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ai-page-breadcrumb',
  imports: [
    RouterModule,
  ],
  templateUrl: './ai-page-breadcrumb.component.html',
  styles: ``
})
export class AiPageBreadcrumbComponent {
  @Input() pageTitle!: string;
}
