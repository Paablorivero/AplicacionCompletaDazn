import {inject, Injectable, signal} from '@angular/core';
import { authUrl} from '../../ExternalRouting/backendRoutes';
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

  // Para validar que un usuario está logeado al iniciar o refrescar la página defino un signal de estado
  private readonly isLoggedIn0 = signal(false);
  readonly isLoggedIn1 = this.isLoggedIn0.asReadonly();

  // Para almacenar la información necesaria del usuario autenticado hago lo mismo
  private readonly authUser0 = signal<AuthUser | null>(null);
  readonly authUser1 = this.authUser0.asReadonly();

  // Inyecto HttpClient
  private http = inject(HttpClient);

  // Inyecto servicio de usuarios
  private userService = inject(UsuariosService);
  private equipoLigaService = inject(EquipoligaService);
  private equipoDataService = inject(EquipoDataService);

  // Para poder conocer la identidad de
  constructor(){
  //   Lo primero que tiene que hacer el programa al abrirse es comprobar si hay un token para saber si ya hay un usuario
  //   identificado es actualizar el estado del signal dependiendo de si hay token o no.
    this.authStatus();
  }



  registerUser(registerData: RegisterForm): Promise<void>{

    // Transformamos los datos que vienen del form para que en la petición se mande un string
    const modifiedData : RegisterRequest={
      username: registerData.username,
      email: registerData.email,
      password: registerData.password,
      fechaNacimiento: registerData.fechaNacimiento.toISOString()
    }

    return lastValueFrom(this.http.post<void>(`${authUrl}/register`, modifiedData));
  }


  // Este es el método que se encarga de hacer la petición para el login de un usuario y manejar los datos que se devuelven.
  // Esos datos se manejan aquí para evitar que se tenga que hacer en el componente.
  async loginUser(loginData: Userlogin): Promise<void>{
    // Si venimos de otro usuario, limpiamos selección y cachés antes de arrancar una nueva sesión.
    this.clearSessionState();

    const response = await lastValueFrom(this.http.post<UserLoginResponse>(`${authUrl}/login`, loginData));

    this.authUser0.set(response.user);
    this.isLoggedIn0.set(true);

    localStorage.setItem('token', response.token);
    localStorage.setItem('role', response.user.rol);
  }

//   Un metodo para que cualquier otro elemento o el interceptor obtengan el token
  getToken(){
    return localStorage.getItem('token');
  }

  // Comprobamos si ya había un usuario logeado o autenticado en el sistema mediante la existencia de token en localstorage
  // o no además de la validez del token, que puede no ser válido o simplemente haya expirado pero siga almacenado
  private async authStatus() {

    const token = localStorage.getItem('token');

    // Si no hay token no debemos de hacer nada
    if(!token){
      this.clearSessionState();
      return;
    }

    try{
      // Si hay token hay que pedir el perfil al back, para actualizar valores
      const user: Userprofile = await this.userService.userProfile();

      // Como el endpoint del perfil devuelve más datos debo de asegurarme de completar este objeto bien
      const logedUser: AuthUser = {
        uuid: user.usuarioId,
        username: user.username,
        rol: user.rol,
      }
    //   Actualizamos valores
      this.authUser0.set(logedUser);
      this.isLoggedIn0.set(true);
      localStorage.setItem('role', user.rol);
    }catch(error){
    // Si hay error, 401/403 simplemente llamo a la función logout que actualiza los estados correctamente
      this.userLogOut();
    }
  }

// Defino un método para el logout de un usuario.
  userLogOut(){
    this.clearSessionState();
  }

  private clearSessionState(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.equipoLigaService.clearSeleccion();
    this.equipoDataService.resetEstado();
    this.isLoggedIn0.set(false);
    this.authUser0.set(null);
  }

  getRole(): string | null {
    return this.authUser0()?.rol ?? localStorage.getItem('role');
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

}
