import { Component, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';

// Gestiona la visibilidad y persistencia del consentimiento de cookies.
@Component({
  selector: 'app-cookie-consent',
  imports: [TranslatePipe],
  templateUrl: './cookie-consent.html',
  styleUrl: './cookie-consent.css',
})
export class CookieConsent {
  private readonly STORAGE_KEY = 'fnts_cookie_consent';

  visible = signal(false);
  closing = signal(false);

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      this.visible.set(true);
    }
  }

  accept(): void {
    this.dismiss('accepted');
  }

  reject(): void {
    this.dismiss('rejected');
  }

  private dismiss(value: string): void {
    this.closing.set(true);
    setTimeout(() => {
      localStorage.setItem(this.STORAGE_KEY, value);
      this.visible.set(false);
    }, 400);
  }
}
