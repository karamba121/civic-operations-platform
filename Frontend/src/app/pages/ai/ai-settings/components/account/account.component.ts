import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-settings-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.component.html'
})
export class AccountComponent {
  @Input() activeTab: string = 'account';

  fullName: string = '';
  email: string = '';
  workspaceName: string = '';
  twoFactorEnabled: boolean = false;

  saveChanges() {
    alert('Changes saved successfully!');
  }

  updatePassword() {
    alert('Password update dialog triggered!');
  }

  manageSessions() {
    alert('Manage sessions dialog triggered!');
  }

  logoutAll() {
    alert('Logged out from all other devices.');
  }

  deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action is irreversible.')) {
      alert('Account deletion requested.');
    }
  }
}
