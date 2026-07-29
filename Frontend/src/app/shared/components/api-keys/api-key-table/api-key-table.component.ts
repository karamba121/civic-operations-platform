import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SwitchComponent } from '../../form/input/switch.component';
import { AddApiKeyModalComponent } from '../add-api-key-modal/add-api-key-modal.component';

interface ApiKey {
  id: string;
  name: string;
  maskedValue: string;
  actualValue: string;
  status: "Active" | "Disabled";
  created: string;
  lastUsed: string;
  hasToggle: boolean;
  isEditing?: boolean;
}

@Component({
  selector: 'app-api-key-table',
  imports: [
    CommonModule,
    SwitchComponent,
    AddApiKeyModalComponent,
    FormsModule
  ],
  templateUrl: './api-key-table.component.html',
  styles: ``
})
export class ApiKeyTableComponent {

  copiedId: string | null = null;


  apiKeysData: ApiKey[] = [
    {
      id: "1",
      name: "Production API key",
      maskedValue: "sk_live_**********4248",
      actualValue: "sk_live_89347598347598347594248",
      status: "Disabled",
      created: "25 Jan, 2025",
      lastUsed: "Today, 10:45 AM",
      hasToggle: true,
    },
    {
      id: "2",
      name: "Development API key",
      maskedValue: "dev_live_**********4923",
      actualValue: "dev_live_89347598347598347594923",
      status: "Active",
      created: "29 Dec, 2024",
      lastUsed: "Today, 12:40 AM",
      hasToggle: false,
    },
    {
      id: "3",
      name: "Legacy API Key",
      maskedValue: "leg_live_**********0932",
      actualValue: "leg_live_kljeorjioweio0932",
      status: "Active",
      created: "12 Mar, 2024",
      lastUsed: "Today, 11:45 PM",
      hasToggle: false,
    },
  ];

  handleCopy(apiKey: ApiKey) {
    navigator.clipboard.writeText(apiKey.actualValue).then(() => {
      this.copiedId = apiKey.id;
      setTimeout(() => (this.copiedId = null), 1500);
    });
  }

  handleToggle(apiKey: ApiKey, checked: boolean) {
    apiKey.status = checked ? 'Active' : 'Disabled';
  }

  deleteApiKey(id: string) {
    if (confirm('Are you sure you want to delete this API key?')) {
      this.apiKeysData = this.apiKeysData.filter((key) => key.id !== id);
    }
  }

  regenerateApiKey(id: string) {
    const key = this.apiKeysData.find((k) => k.id === id);
    if (key) {
      const newKey = this.generateRandomKey();
      key.actualValue = newKey;
      key.maskedValue = this.maskKey(newKey);
    }
  }

  addApiKey(name: string) {
    const newKeyString = this.generateRandomKey();
    const newKey: ApiKey = {
        id: (this.apiKeysData.length + 1).toString(),
        name: name,
        actualValue: newKeyString,
        maskedValue: this.maskKey(newKeyString),
        status: 'Active',
        created: new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }),
        lastUsed: 'Just now',
        hasToggle: true,
    };
    this.apiKeysData = [...this.apiKeysData, newKey];
  }

  editApiKey(apiKey: ApiKey) {
    const newName = prompt('Enter new name for API Key', apiKey.name);
    if (newName !== null && newName.trim() !== '') {
      apiKey.name = newName.trim();
    }
  }

  private generateRandomKey(): string {
    const prefix = 'sk_live_';
    const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return prefix + randomPart;
  }

  private maskKey(key: string): string {
    if (key.length <= 12) return key;
    const suffix = key.substring(key.length - 4);
    const parts = key.split('_');
    if (parts.length >= 2) {
      const prefix = parts.slice(0, 2).join('_') + '_';
      return `${prefix}**********${suffix}`;
    }
    const prefix = key.substring(0, 8);
    return `${prefix}**********${suffix}`;
  }
}
