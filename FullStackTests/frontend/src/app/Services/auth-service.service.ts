import {inject, Injectable, signal} from '@angular/core';
import {authUrl} from '../../ExternalRouting/backendRoutes';
import {RegisterForm, RegisterRequest} from '../interfaces/register-request.interface';
import {HttpClient} from '@angular/common/http';
import {lastValueFrom} from 'rxjs';
import {Userlogin} from '../interfaces/userlogin.interface';
import {AuthUser, UserLoginResponse} from '../interfaces/user-login-response.interface';
import {UsuariosService} from './usuarios.service';
import {Userprofile} from '../interfaces/dtos/userprofile.interface';
import {EquipoligaService} from './equipoliga.service';
import {EquipoDataService} from './equipo-data.service';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {

  private readonly isLoggedIn0 = signal(false);
  readonly isLoggedIn1 = this.isLoggedIn0.asReadonly();

  private readonly authUser0 = signal<AuthUser | null>(null);
  readonly authUser1 = this.authUser0.asReadonly();

  private readonly authReady0 = signal(false);
  readonly authReady = this.authReady0.asReadonly();

  private http = inject(HttpClient);
  private userService = inject(UsuariosService);
  private equipoLigaService = inject(EquipoligaService);
  private equipoDataService = inject(EquipoDataService);

  constructor() {
    void this.authStatus();
  }

  registerUser(registerData: RegisterForm): Promise<void> {
    const modifiedData: RegisterRequest = {
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
      fechaNacimiento: registerData.fechaNacimiento.toISOString()
    };

    return lastValueFrom(this.http.post<void>(`${authUrl}/register`, modifiedData));
  }

  async loginUser(loginData: Userlogin): Promise<void> {
    const response = await lastValueFrom(
      this.http.post<UserLoginResponse>(`${authUrl}/login`, loginData)
    );

    this.clearLocalCaches();

    this.authUser0.set(response.user);
    this.isLoggedIn0.set(true);

    localStorage.setItem('token', response.token);
    localStorage.setItem('role', response.user.rol);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async authStatus(): Promise<void> {
    const token = localStorage.getItem('token');

    if (!token) {
      this.isLoggedIn0.set(false);
      this.authUser0.set(null);
      this.authReady0.set(true);
      return;
    }

    try {
      const user: Userprofile = await this.userService.userProfile();

      const logedUser: AuthUser = {
        uuid: user.usuarioId,
        username: user.username,
        rol: user.rol,
      };

      this.authUser0.set(logedUser);
      this.isLoggedIn0.set(true);
      localStorage.setItem('role', user.rol);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      this.isLoggedIn0.set(false);
      this.authUser0.set(null);
    } finally {
      this.authReady0.set(true);
    }
  }

  userLogOut(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.clearLocalCaches();
    this.isLoggedIn0.set(false);
    this.authUser0.set(null);
  }

  private clearLocalCaches(): void {
    this.equipoLigaService.clearSeleccion();
    this.equipoDataService.resetEstado();
  }

  getRole(): string | null {
    return this.authUser0()?.rol ?? localStorage.getItem('role');
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }
}
