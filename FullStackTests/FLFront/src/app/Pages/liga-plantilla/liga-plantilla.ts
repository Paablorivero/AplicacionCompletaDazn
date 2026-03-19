import {ChangeDetectorRef, Component, effect, inject, OnInit} from '@angular/core';
import {AlineacionesService} from '../../Services/alineaciones.service';
import {JugadorResumenDto} from '../../interfaces/dtos/jugadorresumendto';
import {ControljornadasService} from '../../Services/controljornadas.service';
import {EquipoligaService} from '../../Services/equipoliga.service';
import {Posicion} from '../../interfaces/types/posicion.type';
import {JugadorAlineacionComponent} from '../../Components/jugador-alineacion/jugador-alineacion.component';
import {TemporadaService} from '../../Services/temporada.service';
import {HttpErrorResponse} from '@angular/common/http';
import {UsuariosService} from '../../Services/usuarios.service';
import {Liga} from '../../interfaces/liga.interface';
import {LigasService} from '../../Services/ligas.service';
import {EquipoDataService} from '../../Services/equipo-data.service';
import {TranslatePipe} from '../../pipes/translate.pipe';

// Gestiona la carga de plantilla y los cambios de jugadores en la alineación.
@Component({
  selector: 'app-liga-plantilla',
  imports: [JugadorAlineacionComponent, TranslatePipe],
  templateUrl: './liga-plantilla.html',
  styleUrl: './liga-plantilla.css',
  standalone: true
})
export class LigaPlantilla implements OnInit {

  temporadaSev = inject(TemporadaService);

  private cdr = inject(ChangeDetectorRef);

  // Titulares agrupados por posición para pintar el campo por líneas.
  titulares: Record<Posicion, JugadorResumenDto[]> = {
    Goalkeeper: [],
    Defender: [],
    Midfielder: [],
    Attacker: []
  };

  suplentes: JugadorResumenDto[] = [];
  selectedTitular: JugadorResumenDto | null = null;
  feedback: string = '';
  saveMessage: string = '';
  loadError: string = '';
  isLoading: boolean = false;
  isSaving: boolean = false;
  isSelling: boolean = false;
  hasUnsavedLineupChanges: boolean = false;
  ventaError: string = '';
  ventaMensaje: string = '';
  jugadorParaVenta: JugadorResumenDto | null = null;
  private dragged:
    | {
        jugador: JugadorResumenDto;
        source: 'titular' | 'suplente';
        sourcePos?: Posicion;
        sourceIndex: number;
      }
    | null = null;

  alineacionService = inject(AlineacionesService);
  jornadasService = inject(ControljornadasService);
  seleccionEquipoLiga = inject(EquipoligaService);
  usuariosService = inject(UsuariosService);
  ligasService = inject(LigasService);
  equipoDataService = inject(EquipoDataService);

  constructor(){
    effect(() => {
      const equipo = this.seleccionEquipoLiga.equipoSeleccionado();
      const jornada = this.jornadasService.jornadaSeleccionada();

      if (equipo && jornada) {
        void this.loadAlineacion();
      }
    });
  }

  async ngOnInit() {
    try {
      await this.ensureLigaYEquipoSeleccionados();
    } catch (error) {
      this.loadError = 'No se pudo inicializar la selección de liga/equipo.';
    }
  }

  resetEstructura() {
    this.titulares = {
      Goalkeeper: [],
      Defender: [],
      Midfielder: [],
      Attacker: []
    };
  }

  async loadAlineacion() {
    this.isLoading = true;
    this.loadError = '';

    this.resetEstructura();
    this.suplentes = [];
    try {
      await this.temporadaSev.obtenerJornadaActual();
      const equipo = this.seleccionEquipoLiga.equipoSeleccionado();
      const jornada = this.jornadasService.jornadaSeleccionada();

      if (!equipo || !jornada) {
        this.loadError = 'No hay equipo o jornada seleccionados.';
        return;
      }

      const plantillaJornada: JugadorResumenDto[] = await this.obtenerPlantillaParaJornada(equipo.equipoId, jornada);
      const data: JugadorResumenDto[] = await this.obtenerAlineacionConFallback(equipo.equipoId, jornada, plantillaJornada);

      const nuevosTitulares: Record<Posicion, JugadorResumenDto[]> = {
        Goalkeeper: [],
        Defender: [],
        Midfielder: [],
        Attacker: []
      };

      for (const jugador of data) {
        nuevosTitulares[jugador.posicion].push(jugador);
      }

      this.titulares = {...nuevosTitulares};
      this.loadSuplentes(plantillaJornada);
      this.hasUnsavedLineupChanges = false;
    } catch (error) {
      console.error('Error cargando alineacion/plantilla:', error);
      if (error instanceof HttpErrorResponse && error.error?.error) {
        this.loadError = error.error.error;
      } else {
        this.loadError = 'No se pudo cargar la plantilla del equipo.';
      }
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private async obtenerAlineacionConFallback(
    equipoId: string,
    jornadaId: number,
    plantillaJornada: JugadorResumenDto[]
  ): Promise<JugadorResumenDto[]> {
    try {
      return await this.alineacionService.getAlineacion(equipoId, jornadaId);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 404) {
        // Si no hay alineacion guardada, construimos 4-3-3 desde la plantilla activa.
        return this.construirAlineacion433(plantillaJornada);
      }
      throw error;
    }
  }

  private construirAlineacion433(plantilla: JugadorResumenDto[]): JugadorResumenDto[] {
    const gk = plantilla.filter(j => j.posicion === 'Goalkeeper').slice(0, 1);
    const df = plantilla.filter(j => j.posicion === 'Defender').slice(0, 4);
    const mf = plantilla.filter(j => j.posicion === 'Midfielder').slice(0, 3);
    const at = plantilla.filter(j => j.posicion === 'Attacker').slice(0, 3);
    return [...gk, ...df, ...mf, ...at];
  }

  private async obtenerPlantillaParaJornada(equipoId: string, jornadaId: number): Promise<JugadorResumenDto[]> {
    const jornadaActiva = this.jornadasService.jornadaActiva();

    // En la jornada activa siempre leemos la plantilla activa para reflejar
    // ventas/compras inmediatamente en pantalla.
    if (jornadaActiva !== null && jornadaId === jornadaActiva) {
      return await this.alineacionService.getPlantillaActiva(equipoId);
    }

    try {
      const plantillaJornada = await this.alineacionService.getPlantillaJornada(equipoId, jornadaId);
      if (plantillaJornada.length > 0) {
        return plantillaJornada;
      }
      // Si no hay plantilla en la jornada solicitada, usamos la activa para no bloquear la UI.
      return await this.alineacionService.getPlantillaActiva(equipoId);
    } catch (error) {
      // Fallback para equipos nuevos o mientras el endpoint de plantilla por jornada no esté disponible.
      if (error instanceof HttpErrorResponse && error.status === 404) {
        return await this.alineacionService.getPlantillaActiva(equipoId);
      }
      throw error;
    }
  }

  private async ensureLigaYEquipoSeleccionados(): Promise<void> {
    const participaciones = await this.usuariosService.getTeamsLeaguesFromUser();
    const equipos = participaciones.Equipos ?? [];
    if (equipos.length === 0) {
      return;
    }

    const ligaActual = this.seleccionEquipoLiga.ligaSeleccionada();
    const equipoActual = this.seleccionEquipoLiga.equipoSeleccionado();
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

    this.seleccionEquipoLiga.setLiga(liga);
    this.seleccionEquipoLiga.setEquipo({
      equipoId: primerEquipo.equipoId,
      nombre: primerEquipo.nombre,
      logo: null,
      usuarioId: '',
      ligaId: primerEquipo.ligaId,
    });
  }

  loadSuplentes(plantilla: JugadorResumenDto[]){
    const titularesIds = new Set<number>();

    for (const posicion in this.titulares) {
      this.titulares[posicion as Posicion].forEach(j => titularesIds.add(j.jugadorId));
    }

    this.suplentes = plantilla.filter(jugador => !titularesIds.has(jugador.jugadorId));
  }

  selectTitular(jugador: JugadorResumenDto){
    this.feedback = '';
    this.selectedTitular = jugador;
  }

  cambiarJugador(suplente: JugadorResumenDto){
    if(!this.selectedTitular){
      return;
    }

    const posicion = this.selectedTitular.posicion;
    this.feedback = '';

    if (suplente.posicion !== posicion) {
      this.showFeedback('No puedes poner a ese jugador en esa posicion.');
      return;
    }

    this.titulares[posicion] = this.titulares[posicion].map(j => j.jugadorId === this.selectedTitular!.jugadorId ? suplente : j);

    this.suplentes.push(this.selectedTitular);
    this.suplentes = this.suplentes.filter(j => j.jugadorId !== suplente.jugadorId);
    this.hasUnsavedLineupChanges = true;

    this.selectedTitular = null;
  }

  startDragTitular(event: DragEvent, posicion: Posicion, index: number): void {
    const jugador = this.titulares[posicion][index];
    if (!jugador) return;

    this.dragged = {
      jugador,
      source: 'titular',
      sourcePos: posicion,
      sourceIndex: index
    };
    this.feedback = '';
    event.dataTransfer?.setData('text/plain', String(jugador.jugadorId));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  startDragSuplente(event: DragEvent, index: number): void {
    const jugador = this.suplentes[index];
    if (!jugador) return;

    this.dragged = {
      jugador,
      source: 'suplente',
      sourceIndex: index
    };
    this.feedback = '';
    event.dataTransfer?.setData('text/plain', String(jugador.jugadorId));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  dropOnTitular(event: DragEvent, targetPos: Posicion, targetIndex: number): void {
    event.preventDefault();
    if (!this.dragged) return;

    const target = this.titulares[targetPos][targetIndex];
    if (!target) {
      this.clearDrag();
      return;
    }

    if (this.dragged.jugador.posicion !== targetPos) {
      // Regla clave: solo se permite intercambiar jugadores de la misma posicion.
      this.showFeedback('No puedes poner a ese jugador en esa posicion.');
      this.clearDrag();
      return;
    }

    if (this.dragged.source === 'suplente') {
      const suplenteActual = this.suplentes[this.dragged.sourceIndex];
      if (!suplenteActual) {
        this.clearDrag();
        return;
      }

      this.titulares[targetPos][targetIndex] = suplenteActual;
      this.suplentes[this.dragged.sourceIndex] = target;
      this.selectedTitular = null;
      this.feedback = '';
      this.hasUnsavedLineupChanges = true;
      this.clearDrag();
      return;
    }

    const sourcePos = this.dragged.sourcePos;
    if (!sourcePos) {
      this.clearDrag();
      return;
    }

    const sourceIndex = this.dragged.sourceIndex;
    const sourcePlayer = this.titulares[sourcePos][sourceIndex];
    if (!sourcePlayer) {
      this.clearDrag();
      return;
    }

    this.titulares[sourcePos][sourceIndex] = target;
    this.titulares[targetPos][targetIndex] = sourcePlayer;
    this.feedback = '';
    this.hasUnsavedLineupChanges = true;
    this.clearDrag();
  }

  dropOnSuplente(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    if (!this.dragged) return;

    const target = this.suplentes[targetIndex];
    if (!target) {
      this.clearDrag();
      return;
    }

    if (this.dragged.source === 'titular') {
      const sourcePos = this.dragged.sourcePos;
      if (!sourcePos) {
        this.clearDrag();
        return;
      }

      if (target.posicion !== sourcePos) {
        // Al bajar un titular al banquillo se valida tambien la compatibilidad de posicion.
        this.showFeedback('No puedes poner a ese jugador en esa posicion.');
        this.clearDrag();
        return;
      }

      const titular = this.titulares[sourcePos][this.dragged.sourceIndex];
      if (!titular) {
        this.clearDrag();
        return;
      }

      this.titulares[sourcePos][this.dragged.sourceIndex] = target;
      this.suplentes[targetIndex] = titular;
      this.selectedTitular = null;
      this.feedback = '';
      this.hasUnsavedLineupChanges = true;
      this.clearDrag();
      return;
    }

    const sourceIndex = this.dragged.sourceIndex;
    const sourcePlayer = this.suplentes[sourceIndex];
    if (!sourcePlayer) {
      this.clearDrag();
      return;
    }

    this.suplentes[sourceIndex] = target;
    this.suplentes[targetIndex] = sourcePlayer;
    this.feedback = '';
    this.hasUnsavedLineupChanges = true;
    this.clearDrag();
  }

  endDrag(): void {
    this.clearDrag();
  }

  private clearDrag(): void {
    this.dragged = null;
  }

  private showFeedback(message: string): void {
    this.feedback = message;
    setTimeout(() => {
      if (this.feedback === message) {
        this.feedback = '';
      }
    }, 2800);
  }

  closeFeedback(): void {
    this.feedback = '';
  }

  solicitarVenta(jugador: JugadorResumenDto, event?: Event): void {
    event?.stopPropagation();
    this.ventaError = '';
    this.ventaMensaje = '';
    this.jugadorParaVenta = jugador;
  }

  cancelarVenta(): void {
    this.jugadorParaVenta = null;
    this.ventaError = '';
  }

  ingresoEstimadoVenta(jugador: JugadorResumenDto | null): number {
    if (!jugador?.valor || jugador.valor <= 0) {
      return 0;
    }
    return Math.floor(jugador.valor / 2);
  }

  async confirmarVenta(): Promise<void> {
    const jugador = this.jugadorParaVenta;
    const liga = this.seleccionEquipoLiga.ligaSeleccionada();
    const jornadaSeleccionada = this.jornadasService.jornadaSeleccionada();

    if (!jugador || !liga) {
      return;
    }

    if (this.hasUnsavedLineupChanges) {
      this.ventaError = 'Guarda la alineacion antes de vender jugadores para evitar inconsistencias.';
      return;
    }

    this.isSelling = true;
    this.ventaError = '';
    this.ventaMensaje = '';
    const guardTimeout = setTimeout(() => {
      if (this.isSelling) {
        this.isSelling = false;
        this.ventaError = 'La venta está tardando demasiado. Inténtalo de nuevo.';
        this.cdr.detectChanges();
      }
    }, 15000);

    try {
      const response = await Promise.race([
        this.ligasService.venderJugadorMercado(liga.ligaId, jugador.jugadorId, jornadaSeleccionada ?? undefined),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('VENTA_TIMEOUT')), 12000)
        )
      ]);
      this.suplentes = this.suplentes.filter((j) => j.jugadorId !== jugador.jugadorId);
      this.ventaMensaje = `Has vendido a ${jugador.nombre} por ${response.ingresoVenta} EUR.`;
      this.jugadorParaVenta = null;
      this.ligasService.clearMercadoCache(liga.ligaId);
      await this.loadAlineacion();

      this.equipoDataService.equipoActual.update((equipo) =>
        equipo ? { ...equipo, presupuesto: response.presupuestoRestante } : equipo
      );
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.error?.error) {
        this.ventaError = error.error.error;
      } else if (error instanceof Error && error.message === 'VENTA_TIMEOUT') {
        this.ventaError = 'La venta está tardando demasiado. Inténtalo de nuevo.';
      } else if (error instanceof Error && error.name === 'TimeoutError') {
        this.ventaError = 'La venta está tardando demasiado. Inténtalo de nuevo.';
      } else {
        this.ventaError = 'No se pudo completar la venta del jugador.';
      }
      this.cdr.detectChanges();
    } finally {
      clearTimeout(guardTimeout);
      this.isSelling = false;
      this.cdr.detectChanges();
    }
  }

  async guardar() {
    this.saveMessage = '';
    const jugadoresIds: number[] = [];

    this.titulares.Goalkeeper.forEach(j => jugadoresIds.push(j.jugadorId));
    this.titulares.Defender.forEach(j => jugadoresIds.push(j.jugadorId));
    this.titulares.Midfielder.forEach(j => jugadoresIds.push(j.jugadorId));
    this.titulares.Attacker.forEach(j => jugadoresIds.push(j.jugadorId));

    const equipo = this.seleccionEquipoLiga.equipoSeleccionado();
    const jornada = this.jornadasService.jornadaSeleccionada();

    if (!equipo || !jornada) return;

    this.isSaving = true;

    try {
      await this.alineacionService.actualizarAlineacion(equipo.equipoId,jornada, jugadoresIds);
      this.saveMessage = 'Alineacion guardada correctamente.';
      this.hasUnsavedLineupChanges = false;
    } catch {
      this.saveMessage = 'No se pudo guardar la alineacion. Intentalo de nuevo.';
    } finally {
      this.isSaving = false;
    }
  }

}
