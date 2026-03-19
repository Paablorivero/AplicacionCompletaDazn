import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MercadoJugadorDto } from '../../interfaces/dtos/mercadojugadordto.interface';
import { LigasService } from '../../Services/ligas.service';
import { EquipoligaService } from '../../Services/equipoliga.service';
import { EquipoDataService } from '../../Services/equipo-data.service';
import { UsuariosService } from '../../Services/usuarios.service';
import { Liga } from '../../interfaces/liga.interface';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-liga-mercado',
  imports: [TranslatePipe],
  templateUrl: './liga-mercado.html',
  styleUrl: './liga-mercado.css',
})
export class LigaMercado implements OnInit {
  private readonly ligasService = inject(LigasService);
  private readonly equipoLigaService = inject(EquipoligaService);
  private readonly equipoDataService = inject(EquipoDataService);
  private readonly usuariosService = inject(UsuariosService);

  protected readonly jugadoresMercado = signal<MercadoJugadorDto[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly comprandoJugadorId = signal<number | null>(null);
  protected readonly mensaje = signal('');
  protected readonly jugadorParaConfirmar = signal<MercadoJugadorDto | null>(null);

  async ngOnInit(): Promise<void> {
    await this.ensureLigaYEquipoSeleccionados();
    const ligaId = this.equipoLigaService.ligaSeleccionada()?.ligaId;
    if (ligaId) {
      await this.equipoDataService.cargarEquipoEnLiga(ligaId);
    }
    await this.cargarMercado();
  }

  protected async cargarMercado(): Promise<void> {
    const liga = this.equipoLigaService.ligaSeleccionada();

    if (!liga) {
      this.error.set('Selecciona una liga para ver el mercado.');
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    try {
      const jugadores = await this.ligasService.getMercadoLigaCached(liga.ligaId, 20);
      this.jugadoresMercado.set(jugadores);
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.error?.error) {
        this.error.set(e.error.error);
      } else {
        this.error.set('No se pudo cargar el mercado de jugadores.');
      }
    } finally {
      this.cargando.set(false);
    }
  }

  protected solicitarCompra(jugador: MercadoJugadorDto): void {
    this.jugadorParaConfirmar.set(jugador);
  }

  protected cancelarCompra(): void {
    this.jugadorParaConfirmar.set(null);
  }

  protected async confirmarCompra(): Promise<void> {
    const liga = this.equipoLigaService.ligaSeleccionada();
    const jugador = this.jugadorParaConfirmar();
    if (!liga) {
      this.error.set('Selecciona una liga para poder comprar.');
      return;
    }

    if (!jugador) {
      return;
    }

    this.comprandoJugadorId.set(jugador.jugadorId);
    this.mensaje.set('');
    this.error.set('');

    try {
      const compra = await this.ligasService.comprarJugadorMercado(liga.ligaId, jugador.jugadorId);
      this.ligasService.removeJugadorMercadoCache(liga.ligaId, jugador.jugadorId);
      this.jugadoresMercado.update((lista) => lista.filter((j) => j.jugadorId !== jugador.jugadorId));
      this.mensaje.set(`Has comprado a ${jugador.nombre}.`);
      this.equipoDataService.equipoActual.update((equipo) =>
        equipo ? { ...equipo, presupuesto: compra.presupuestoRestante } : equipo
      );
      this.jugadorParaConfirmar.set(null);
    } catch (e) {
      if (e instanceof HttpErrorResponse && e.error?.error) {
        this.error.set(e.error.error);
      } else {
        this.error.set('No se pudo completar la compra del jugador.');
      }
    } finally {
      this.comprandoJugadorId.set(null);
    }
  }

  protected estaComprando(jugadorId: number): boolean {
    return this.comprandoJugadorId() === jugadorId;
  }

  protected formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(precio);
  }

  protected etiquetaPosicion(posicion: string | null): string {
    const labels: Record<string, string> = {
      Goalkeeper: 'Portero',
      Defender: 'Defensa',
      Midfielder: 'Centrocampista',
      Attacker: 'Delantero'
    };
    return posicion ? (labels[posicion] ?? posicion) : 'Sin posicion';
  }

  private async ensureLigaYEquipoSeleccionados(): Promise<void> {
    try {
      const participaciones = await this.usuariosService.getTeamsLeaguesFromUser();
      const equipos = participaciones.Equipos ?? [];
      if (equipos.length === 0) {
        return;
      }

      const ligaActual = this.equipoLigaService.ligaSeleccionada();
      const equipoActual = this.equipoLigaService.equipoSeleccionado();
      const seleccionValida = equipos.some((eq) =>
        eq.equipoId === equipoActual?.equipoId && eq.ligaId === ligaActual?.ligaId
      );

      if (seleccionValida) {
        return;
      }

      const primerEquipo = equipos[0];
      if (!primerEquipo || !primerEquipo.Liga) {
        return;
      }

      const liga: Liga = {
        ligaId: primerEquipo.Liga.ligaId,
        nombreLiga: primerEquipo.Liga.nombreLiga,
        usuarioId: '',
      };

      this.equipoLigaService.setLiga(liga);
      this.equipoLigaService.setEquipo({
        equipoId: primerEquipo.equipoId,
        nombre: primerEquipo.nombre,
        logo: null,
        usuarioId: '',
        ligaId: primerEquipo.ligaId,
      });
    } catch {
    }
  }
}
