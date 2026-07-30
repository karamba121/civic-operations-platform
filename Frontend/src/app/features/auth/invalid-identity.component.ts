import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-invalid-identity',
  template: `
    <main class="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <section class="max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 class="text-xl font-semibold text-gray-900">
          Identidade sem acesso
        </h1>
        <p class="mt-3 text-sm text-gray-600">
          Seu login não possui administração global nem vínculo com um tenant.
          Solicite acesso a um administrador.
        </p>
        <button
          type="button"
          class="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          (click)="logout()"
        >
          Sair
        </button>
      </section>
    </main>
  `,
})
export class InvalidIdentityComponent {
  private readonly auth = inject(AuthService);

  logout(): void {
    void this.auth.logout();
  }
}
