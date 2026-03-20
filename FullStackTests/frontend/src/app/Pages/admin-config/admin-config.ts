import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AdminConfigService, AdminJornadaItem, EstadoJornadaAdminResponse } from '../../Services/admin-config.service';
import { UsuariosService } from '../../Services/usuarios.service';
import { AdminUserListItem } from '../../interfaces/dtos/admin-user-list-item.interface';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-admin-config',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './admin-config.html',
  styleUrl: './admin-config.css',
})
export class AdminConfig implements OnInit {
  private adminConfigService = inject(AdminConfigService);
  private usuariosService = inject(UsuariosService);

  readonly cargandoEstadoJornada = signal(false);
  readonly operandoJornada = signal(false);
  readonly cargandoUsuarios = signal(false);
  readonly cargandoJornadas = signal(false);
  readonly cargandoMercado = signal(false);
  readonly mensaje = signal('');
  readonly error = signal('');
  readonly estadoJornada = signal<EstadoJornadaAdminResponse | null>(null);
  readonly usuarios = signal<AdminUserListItem[]>([]);
  readonly jornadas = signal<AdminJornadaItem[]>([]);

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.cargarEstadoJornada(),
      this.cargarUsuarios(),
      this.cargarJornadas(),
    ]);
  }

  private limpiarEstadoMensajes(): void {
    this.error.set('');
    this.mensaje.set('');
  }

  async cargarEstadoJornada(): Promise<void> {
    this.limpiarEstadoMensajes();
    this.cargandoEstadoJornada.set(true);
    try {
      const response = await this.adminConfigService.estadoJornada();
      this.estadoJornada.set(response);
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error.set(err.error?.error ?? 'No se pudo cargar el estado de la jornada.');
    } finally {
      this.cargandoEstadoJornada.set(false);
    }
  }

  async iniciarJornada(): Promise<void> {
    this.limpiarEstadoMensajes();
    this.operandoJornada.set(true);
    try {
      const response = await this.adminConfigService.iniciarJornada();
      this.estadoJornada.update((estadoActual) => estadoActual ? {
        ...estadoActual,
        jornadaIniciada: response.jornadaIniciada,
        jornadaActual: response.jornadaActual,
        maxJornada: estadoActual.maxJornada,
      } : null);
      await this.cargarJornadas();
      this.mensaje.set(`Jornada ${response.jornadaActual} iniciada.`);
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error.set(err.error?.error ?? 'No se pudo iniciar la jornada.');
    } finally {
      this.operandoJornada.set(false);
    }
  }

  async finalizarJornada(): Promise<void> {
    this.limpiarEstadoMensajes();
    this.operandoJornada.set(true);
    try {
      const response = await this.adminConfigService.finalizarJornada();
      this.estadoJornada.update((estadoActual) => estadoActual ? {
        ...estadoActual,
        jornadaIniciada: response.jornadaIniciada,
        jornadaActual: response.jornadaActual,
        maxJornada: estadoActual.maxJornada,
      } : null);
      await this.cargarJornadas();
      const actualizados = response.jugadoresActualizados ?? 0;
      this.mensaje.set(`Jornada finalizada. Jornada activa actual: ${response.jornadaActual}. Mercado actualizado (${actualizados} jugadores).`);
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error.set(err.error?.error ?? 'No se pudo finalizar la jornada.');
    } finally {
      this.operandoJornada.set(false);
    }
  }

  async cargarUsuarios(): Promise<void> {
    this.cargandoUsuarios.set(true);
    try {
      const usuarios = await this.usuariosService.getAllUsersAdmin();
      this.usuarios.set(usuarios);
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error.set(err.error?.error ?? 'No se pudo cargar el listado de usuarios.');
    } finally {
      this.cargandoUsuarios.set(false);
    }
  }

  async cargarJornadas(): Promise<void> {
    this.cargandoJornadas.set(true);
    try {
      const jornadas = await this.adminConfigService.getJornadas();
      this.jornadas.set(jornadas.sort((a, b) => a.jornadaId - b.jornadaId));
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error.set(err.error?.error ?? 'No se pudo cargar el listado de jornadas.');
    } finally {
      this.cargandoJornadas.set(false);
    }
  }

  async actualizarMercado(): Promise<void> {
    this.limpiarEstadoMensajes();
    this.cargandoMercado.set(true);
    try {
      const response = await this.adminConfigService.actualizarMercado();
      this.mensaje.set(`Mercado actualizado manualmente (${response.jugadoresActualizados} jugadores).`);
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error.set(err.error?.error ?? 'No se pudo actualizar el mercado.');
    } finally {
      this.cargandoMercado.set(false);
    }
  }

  formatFecha(fecha: string | null): string {
    if (!fecha) {
      return '--';
    }

    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) {
      return '--';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

}
