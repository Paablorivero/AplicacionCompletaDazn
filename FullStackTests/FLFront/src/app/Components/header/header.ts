import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthServiceService } from '../../Services/auth-service.service';
import { TranslateService, AppLang } from '../../Services/translate.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  menuOpen = signal(false);
  langMenuOpen = signal(false);
  private router = inject(Router);
  private authService = inject(AuthServiceService);
  ts = inject(TranslateService);

  readonly languages: { code: AppLang; label: string; flag: string }[] = [
    { code: 'es', label: 'Castellano', flag: '🇪🇸' },
    { code: 'gl', label: 'Galego', flag: '/images/galicia.svg' },
    { code: 'eu', label: 'Euskara', flag: '/images/ikurrina.svg' },
    { code: 'ca', label: 'Català', flag: '/images/senyera.svg' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  get isLogedIn(): boolean {
    return !!this.authService.getToken();
  }

  get headerHomeRoute(): string {
    return this.isLogedIn ? '/daznfantasy/home' : '/daznfantasy';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  get currentFlag(): string {
    return this.languages.find(l => l.code === this.ts.currentLang())?.flag ?? '🌐';
  }

  isImageFlag(flag: string): boolean {
    return flag.startsWith('/');
  }

  mostrarBotonEntrar(): boolean {
    const rutasOcultas = ['/daznfantasy/login', '/daznfantasy/register'];
    return !rutasOcultas.includes(this.router.url);
  }

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleLangMenu(): void {
    this.langMenuOpen.update(v => !v);
  }

  selectLang(lang: AppLang): void {
    this.ts.setLang(lang);
    this.langMenuOpen.set(false);
  }

  closeLangMenu(): void {
    this.langMenuOpen.set(false);
  }

  cerrarSesion(): void {
    this.authService.userLogOut();
    this.closeMenu();
    this.router.navigate(['/daznfantasy/login']);
  }
}
