import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { JugadoresService } from '../../Services/jugadores.service';
import { JugadorListItem } from '../../interfaces/dtos/jugador-list-item.interface';
import { EquipoligaService } from '../../Services/equipoliga.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-liga-jugadores',
  imports: [TranslatePipe],
  templateUrl: './liga-jugadores.html',
  styleUrl: './liga-jugadores.css',
})
export class LigaJugadores implements OnInit {
  private jugadoresService = inject(JugadoresService);
  private equipoLigaService = inject(EquipoligaService);

  readonly cargando = signal(false);
  readonly error = signal('');
  readonly jugadores = signal<JugadorListItem[]>([]);
  readonly jugadoresFiltrados = signal<JugadorListItem[]>([]);
  readonly equiposDisponibles = signal<Array<{ id: number; nombre: string }>>([]);
  readonly posicionesDisponibles = signal<string[]>([]);

  filtroNombre = '';
  filtroEquipoId = '';
  filtroPosicion = '';

  async ngOnInit(): Promise<void> {
    await this.cargarJugadores();
  }

  async cargarJugadores(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');
    try {
      const ligaId = this.equipoLigaService.ligaSeleccionada()?.ligaId;
      const listado = await this.jugadoresService.getAllJugadores(ligaId);
      this.jugadores.set(listado);

      const equiposMap = new Map<number, string>();
      for (const jugador of listado) {
        if (jugador.equipoProfesionalId !== null) {
          equiposMap.set(jugador.equipoProfesionalId, jugador.equipoProfesionalNombre);
        }
      }
      const equipos = Array.from(equiposMap.entries())
        .map(([id, nombre]) => ({ id, nombre }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

      const posiciones = [...new Set(
        listado
          .map(j => j.posicion)
          .filter((p): p is string => Boolean(p && p.trim()))
      )].sort((a, b) => a.localeCompare(b));

      this.equiposDisponibles.set(equipos);
      this.posicionesDisponibles.set(posiciones);
      this.aplicarFiltros();
    } catch (e) {
      const err = e as HttpErrorResponse;
      this.error.set(err.error?.error ?? 'No se pudieron cargar los jugadores.');
    } finally {
      this.cargando.set(false);
    }
  }

  onFiltroNombre(value: string): void {
    this.filtroNombre = value;
    this.aplicarFiltros();
  }

  onFiltroEquipo(value: string): void {
    this.filtroEquipoId = value;
    this.aplicarFiltros();
  }

  onFiltroPosicion(value: string): void {
    this.filtroPosicion = value;
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    const nombre = this.filtroNombre.trim().toLowerCase();
    const equipoId = this.filtroEquipoId ? Number(this.filtroEquipoId) : null;
    const posicion = this.filtroPosicion;

    const filtrados = this.jugadores().filter((jugador) => {
      const nombreOk =
        nombre.length === 0 ||
        jugador.nombre.toLowerCase().includes(nombre) ||
        (jugador.firstName ?? '').toLowerCase().includes(nombre) ||
        (jugador.lastName ?? '').toLowerCase().includes(nombre);

      const equipoOk = equipoId === null || jugador.equipoProfesionalId === equipoId;
      const posicionOk = !posicion || (jugador.posicion ?? '') === posicion;

      return nombreOk && equipoOk && posicionOk;
    });

    this.jugadoresFiltrados.set(filtrados);
  }

  posicionLabel(posicion: string | null): string {
    const labels: Record<string, string> = {
      Goalkeeper: 'Portero',
      Defender: 'Defensa',
      Midfielder: 'Centrocampista',
      Attacker: 'Delantero'
    };
    return posicion ? (labels[posicion] ?? posicion) : 'Sin posicion';
  }

  precioEuros(valor: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(valor);
  }

  estadoJugador(jugador: JugadorListItem): string {
    if (!jugador.tieneEquipoEnLiga) {
      return 'Sin equipo';
    }

    if (jugador.equipoLigaNombre) {
      return `Con equipo (${jugador.equipoLigaNombre})`;
    }

    return 'Con equipo';
  }
}
