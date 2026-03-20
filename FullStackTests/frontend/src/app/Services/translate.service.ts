import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type AppLang = 'es' | 'gl' | 'eu' | 'ca' | 'en';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private readonly STORAGE_KEY = 'app_lang';
  private translations = signal<Record<string, string>>({});
  currentLang = signal<AppLang>(this.loadSavedLang());
  ready = signal(false);

  readonly langLabel = computed(() => {
    const labels: Record<AppLang, string> = { es: 'Castellano', gl: 'Galego', eu: 'Euskara', ca: 'Català', en: 'English' };
    return labels[this.currentLang()];
  });

  constructor(private http: HttpClient) {
    this.loadTranslations(this.currentLang());
  }

  setLang(lang: AppLang): void {
    if (lang === this.currentLang()) return;
    this.currentLang.set(lang);
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.loadTranslations(lang);
  }

  get(key: string): string {
    return this.translations()[key] ?? key;
  }

  private loadSavedLang(): AppLang {
    const saved = (typeof localStorage !== 'undefined') ? localStorage.getItem(this.STORAGE_KEY) : null;
    if (saved === 'es' || saved === 'gl' || saved === 'eu' || saved === 'ca' || saved === 'en') return saved;
    return 'es';
  }

  private loadTranslations(lang: AppLang): void {
    this.ready.set(false);
    this.http.get<Record<string, string>>(`/i18n/${lang}.json`).subscribe({
      next: (data) => {
        this.translations.set(data);
        this.ready.set(true);
      },
      error: () => {
        this.translations.set({});
        this.ready.set(true);
      }
    });
  }
}
