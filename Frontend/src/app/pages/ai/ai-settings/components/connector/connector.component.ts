import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-settings-connector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connector.component.html'
})
export class ConnectorComponent {
  @Input() activeTab: string = 'account';

  googleDriveConnected: boolean = true;
  githubConnected: boolean = false;
  calendarConnected: boolean = false;
  slackConnected: boolean = false;

  productionKey: string = 'lk_live_············42ab';

  toggleGoogleDrive() {
    this.googleDriveConnected = !this.googleDriveConnected;
    alert(this.googleDriveConnected ? 'Google Drive Connected successfully!' : 'Google Drive disconnected.');
  }

  toggleGithub() {
    this.githubConnected = !this.githubConnected;
    alert(this.githubConnected ? 'Github Connected successfully!' : 'Github disconnected.');
  }

  toggleCalendar() {
    this.calendarConnected = !this.calendarConnected;
    alert(this.calendarConnected ? 'Calendar Connected successfully!' : 'Calendar disconnected.');
  }

  toggleSlack() {
    this.slackConnected = !this.slackConnected;
    alert(this.slackConnected ? 'Slack Connected successfully!' : 'Slack disconnected.');
  }

  rotateKey() {
    if (confirm('Are you sure you want to rotate this production API key? Any active system integration relying on the old key will break instantly.')) {
      const chars = 'abcdef0123456789';
      let randomPart = '';
      for (let i = 0; i < 4; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      this.productionKey = `lk_live_············${randomPart}`;
      alert('Production key rotated successfully.');
    }
  }

  revokeKey() {
    if (confirm('Revoke this production key? Access to this endpoint will be permanently terminated.')) {
      this.productionKey = 'lk_live_············[revoked]';
      alert('API key revoked.');
    }
  }

  generateKey() {
    const keyName = prompt('Enter a label for the new key:', 'Production Key 2');
    if (keyName) {
      alert(`Generated new API key label "${keyName}": lk_live_abcd...`);
    }
  }
}
