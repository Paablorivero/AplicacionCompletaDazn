import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthServiceService } from '../../Services/auth-service.service';

// Controla navegación global y estados del menú según autenticación.
@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  menuOpen = signal(false);
  private router = inject(Router);
  private authService = inject(AuthServiceService);

  get isLogedIn(): boolean {
    return !!this.authService.getToken();
  }

  get headerHomeRoute(): string {
    return this.isLogedIn ? '/daznfantasy/home' : '/daznfantasy';
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
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

  cerrarSesion(): void {
    this.authService.userLogOut();
    this.closeMenu();
    this.router.navigate(['/daznfantasy/login']);
  }
}
