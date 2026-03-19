import { Component, OnInit, effect, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EquipoligaService } from '../../Services/equipoliga.service';
import { EquipoDataService } from '../../Services/equipo-data.service';
import { UsuariosService } from '../../Services/usuarios.service';
import { Liga } from '../../interfaces/liga.interface';
import { TranslatePipe } from '../../pipes/translate.pipe';

// Contenedor de navegación lateral para secciones internas de una liga.
@Component({
  selector: 'app-dashboard-ligas',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './dashboard-ligas.html',
  styleUrl: './dashboard-ligas.css',
})
export class DashboardLigas implements OnInit {
  protected readonly equipoLigaService = inject(EquipoligaService);
  protected readonly equipoDataService = inject(EquipoDataService);
  private readonly usuariosService = inject(UsuariosService);

  constructor() {
    effect(() => {
      const ligaId = this.equipoLigaService.ligaSeleccionada()?.ligaId;
      if (ligaId) {
        void this.equipoDataService.cargarEquipoEnLiga(ligaId);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.ensureLigaYEquipoSeleccionados();
    const ligaId = this.equipoLigaService.ligaSeleccionada()?.ligaId;
    if (ligaId) {
      await this.equipoDataService.cargarEquipoEnLiga(ligaId);
    }
  }

  protected nombreEquipo(): string {
    return this.equipoDataService.equipoActual()?.nombre ?? 'No disponible';
  }

  protected saldoEquipo(): string {
    const presupuesto = this.equipoDataService.equipoActual()?.presupuesto;
    if (typeof presupuesto !== 'number') {
      return 'No disponible';
    }

    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(presupuesto);
  }

  protected goToClasificacionQueryParams() {
    const liga = this.equipoLigaService.ligaSeleccionada();
    if (!liga) {
      return {};
    }

    return {
      ligaId: liga.ligaId,
      nombreLiga: liga.nombreLiga
    };
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
      if (!primerEquipo?.Liga) {
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
      // Si falla esta resolución, las pantallas hijas mostrarán su estado de error correspondiente.
    }
  }
}
