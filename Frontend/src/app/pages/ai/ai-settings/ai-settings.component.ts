import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AccountComponent } from './components/account/account.component';
import { ConnectorComponent } from './components/connector/connector.component';
import { CreditAndBillingComponent } from './components/credit-and-billing/credit-and-billing.component';
import { DataControlComponent } from './components/data-control/data-control.component';
import { FileAndMediaComponent } from './components/file-and-media/file-and-media.component';
import { GeneralComponent } from './components/general/general.component';
import { MemoryComponent } from './components/memory/memory.component';
import { ModelsComponent } from './components/models/models.component';
import { PersonalizationComponent } from './components/personalization/personalization.component';
import { TabMenuComponent } from './components/tab-menu/tab-menu.component';

@Component({
  selector: 'app-ai-settings',
  imports: [
    CommonModule,
    TabMenuComponent,
    AccountComponent,
    GeneralComponent,
    CreditAndBillingComponent,
    PersonalizationComponent,
    MemoryComponent,
    FileAndMediaComponent,
    ModelsComponent,
    ConnectorComponent,
    DataControlComponent
  ],
  templateUrl: './ai-settings.component.html'
})
export class AiSettingsComponent {
  activeTab: string = 'account';
  isSidebarOpen: boolean = false;

  getTabLabel(tab: string): string {
    const labels: Record<string, string> = {
      'account': 'Account',
      'general': 'General',
      'billing': 'Credit and Billing',
      'personalization': 'Personalization',
      'memory': 'Memory',
      'file-media': 'File & Media',
      'model': 'Models',
      'connector': 'Connector',
      'data-control': 'Data Control'
    };
    return labels[tab] || tab;
  }
}
