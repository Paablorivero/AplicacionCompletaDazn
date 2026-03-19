import {inject, Injectable} from '@angular/core';
import { usersUrl} from '../../ExternalRouting/backendRoutes';
import {HttpClient} from '@angular/common/http';
import {Userprofile} from '../interfaces/dtos/userprofile.interface';
import {lastValueFrom} from 'rxjs';
import {Equiposusuariodto} from '../interfaces/dtos/equiposusuariodto.interface';
import {AdminUserListItem} from '../interfaces/dtos/admin-user-list-item.interface';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {

//   Inyecto servicio http
  private http = inject(HttpClient);


//   Petición para obtener el perfil de usuario

  userProfile(): Promise<Userprofile>{
    return lastValueFrom(this.http.get<Userprofile>(`${usersUrl}/me`));
  }

  // Petición para obtener todos los equipos de un usuario y la liga en la que participan
  getTeamsLeaguesFromUser(): Promise<Equiposusuariodto>{
    return lastValueFrom(this.http.get<Equiposusuariodto>(`${usersUrl}/equipos/participacion`));
  }

  //Peticion para actualizar el perfil de usuario
  updateProfile(username: string, email: string, fechaNacimiento: string): Promise<Userprofile> {
    return lastValueFrom(this.http.patch<Userprofile>(`${usersUrl}/me/update`, { username, email, fechaNacimiento }));
  }

  getAllUsersAdmin(): Promise<AdminUserListItem[]> {
    return lastValueFrom(this.http.get<AdminUserListItem[]>(`${usersUrl}/all`));
  }
}
