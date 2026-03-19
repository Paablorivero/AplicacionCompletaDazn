import { Component, inject, OnInit, signal } from '@angular/core';
import {RouterLink} from '@angular/router';
import { UsuariosService } from '../../Services/usuarios.service';

// Obtiene el usuario para personalizar el hero del home.
@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private usuariosService = inject(UsuariosService);
  username = signal('');

  async ngOnInit(): Promise<void> {
    try {
      const user = await this.usuariosService.userProfile();
      this.username.set(user.username ?? '');
    } catch {
      this.username.set('');
    }
  }
}
