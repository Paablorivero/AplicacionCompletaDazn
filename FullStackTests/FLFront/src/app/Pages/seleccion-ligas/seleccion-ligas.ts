import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { LigasService } from '../../Services/ligas.service';
import { Liga } from '../../interfaces/liga.interface';
import {FormsModule} from '@angular/forms';
import {EquipoligaService} from '../../Services/equipoliga.service';
import {HttpErrorResponse} from '@angular/common/http';
import {UsuariosService} from '../../Services/usuarios.service';
import {Equiposusuariodto} from '../../interfaces/dtos/equiposusuariodto.interface';
import {Equipo} from '../../interfaces/equipo.interface';

// Estructura de fila para mostrar ligas ya unidas con su equipo asociado.
interface LigaUnidaRow {
  ligaId: string;
  nombreLiga: string;
  equipoId: string;
  nombreEquipo: string;
}

@Component({
  selector: 'app-seleccion-ligas',
  imports: [RouterLink, FormsModule],
  templateUrl: './seleccion-ligas.html',
  styleUrl: './seleccion-ligas.css',
})
export class SeleccionLigas implements OnInit {
  private ligasService = inject(LigasService);
  private userService = inject(UsuariosService);

  private equipoLigaService = inject(EquipoligaService);

  private router: Router = inject(Router);

  private cdr = inject(ChangeDetectorRef);
  // Estado principal de la pantalla de ligas y modal de unión.
  allLigas: Liga[] = [];
  ligasDisponibles: Liga[] = [];
  ligasUnidas: LigaUnidaRow[] = [];
  loading = false;
  error = '';
  ligaModal: Liga | null = null;

  // Modal para el nombre del equipo, cuando pulse unir ligas
  mostrarModal = false;
  mostrarModalCrearLiga = false;

  // Campo para el nombre del equipo
  nombreEquipo: string;
  nombreNuevaLiga: string;
  nombreEquipoNuevaLiga: string;

  constructor(){
    this.nombreEquipo = '';
    this.nombreNuevaLiga = '';
    this.nombreEquipoNuevaLiga = '';
  }

  ngOnInit(): void {
    this.loadLigas();
  }

  private async loadLigas(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.ligasUnidas = [];
    this.allLigas = [];
    this.ligasDisponibles = [];

    let joinedLigaIds = new Set<string>();

    try {
      this.allLigas = await this.ligasService.getAllLigas();
    } catch {
      this.error = 'No se pudieron cargar las ligas. Inténtalo de nuevo.';
    }

    try {
      const userLeagues: Equiposusuariodto = await this.userService.getTeamsLeaguesFromUser();
      // Se normaliza la respuesta para usar una sola estructura en toda la pantalla.
      this.ligasUnidas = (userLeagues.Equipos ?? []).map((equipo) => ({
        ligaId: equipo.Liga?.ligaId ?? equipo.ligaId,
        nombreLiga: equipo.Liga?.nombreLiga ?? 'Liga',
        equipoId: equipo.equipoId,
        nombreEquipo: equipo.nombre
      })).filter((row) => Boolean(row.ligaId && row.equipoId));
      joinedLigaIds = new Set(this.ligasUnidas.map((l) => l.ligaId));
    } catch {
      // Si falla esta petición, seguimos mostrando ligas disponibles sin esta separación.
    }

    try {
      const disponibles = await this.ligasService.getLigasPlazasLibres();
      this.ligasDisponibles = disponibles.filter((liga) => !joinedLigaIds.has(liga.ligaId));
    } catch {
      // Si falla ligas disponibles no bloqueamos la página
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  abrirModal(liga: Liga){
    this.ligaModal = liga;
    this.equipoLigaService.setLiga(liga);
    this.mostrarModal = true;
  }

  mostrarPlantilla(ligaUnida: LigaUnidaRow): void {
    const liga = this.allLigas.find((item) => item.ligaId === ligaUnida.ligaId);
    if (liga) {
      this.equipoLigaService.setLiga(liga);
    }

    const equipoSeleccionado: Equipo = {
      equipoId: ligaUnida.equipoId,
      nombre: ligaUnida.nombreEquipo,
      logo: '',
      usuarioId: '',
      ligaId: ligaUnida.ligaId
    };

    this.equipoLigaService.setEquipo(equipoSeleccionado);
    this.router.navigate(['/daznfantasy/liga/plantilla']);
  }

  async confirmarUnirse() {

    const liga = this.ligaModal ?? this.equipoLigaService.ligaSeleccionada();

    if (!liga || !this.nombreEquipo.trim()) return;
    this.error = '';

    try {
      const equipo = await this.ligasService.unirseLiga(liga.ligaId, this.nombreEquipo);

      this.equipoLigaService.setEquipo(equipo);
      this.equipoLigaService.setLiga(liga);

      this.nombreEquipo = '';
      this.mostrarModal = false;
      this.ligaModal = null;

      await this.loadLigas();

      this.router.navigate(['/daznfantasy/liga/plantilla']);
    } catch (e) {
      if (e instanceof HttpErrorResponse) {
        if (e.status === 500) {
          this.error = 'No se pudo completar la unión a la liga. Inténtalo de nuevo en unos segundos.';
        } else if (e.error?.error || e.error?.message) {
          this.error = e.error.error ?? e.error.message;
        } else {
          this.error = `No se pudo unir a la liga (error ${e.status}).`;
        }
      } else {
        this.error = 'Se produjo un error inesperado al unirse a la liga.';
      }
      console.error(e);
    }
  }

  cancelarModal(): void {
    this.mostrarModal = false;
    this.nombreEquipo = '';
    this.ligaModal = null;
  }

  abrirModalCrearLiga(): void {
    this.mostrarModalCrearLiga = true;
    this.nombreNuevaLiga = '';
    this.nombreEquipoNuevaLiga = '';
  }

  async confirmarCrearLiga(): Promise<void> {
    const nombreLiga = this.nombreNuevaLiga.trim();
    const nombreEquipo = this.nombreEquipoNuevaLiga.trim();

    if (!nombreLiga || !nombreEquipo) {
      return;
    }

    this.error = '';

    try {
      await this.ligasService.postLiga(nombreLiga, nombreEquipo);
      this.mostrarModalCrearLiga = false;
      this.nombreNuevaLiga = '';
      this.nombreEquipoNuevaLiga = '';

      await this.loadLigas();
    } catch (e) {
      if (e instanceof HttpErrorResponse) {
        if (e.status === 500) {
          this.error = 'No se pudo crear la liga. Inténtalo de nuevo en unos segundos.';
        } else if (e.error?.error || e.error?.message) {
          this.error = e.error.error ?? e.error.message;
        } else {
          this.error = `No se pudo crear la liga (error ${e.status}).`;
        }
      } else {
        this.error = 'Se produjo un error inesperado al crear la liga.';
      }
      console.error(e);
    }
  }

  cancelarModalCrearLiga(): void {
    this.mostrarModalCrearLiga = false;
    this.nombreNuevaLiga = '';
    this.nombreEquipoNuevaLiga = '';
  }

  cerrarError(): void {
    this.error = '';
  }
}
