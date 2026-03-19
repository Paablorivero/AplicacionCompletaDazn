import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { TranslatePipe } from '../../pipes/translate.pipe';

interface ApiSportsResponse<T> {
  response: T[];
}

interface ClasificacionFila {
  rank: number;
  team: {
    name: string;
    logo: string;
  };
  points: number;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
  };
  goalsDiff: number;
}

interface Partido {
  fixture: {
    date: string;
    status: {
      short: string;
      long: string;
    };
  };
  teams: {
    home: { name: string; logo: string };
    away: { name: string; logo: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

// Renderiza datos de API-Football sin usar widgets.
@Component({
  selector: 'app-liga-widgets',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './liga-widgets.html',
  styleUrl: './liga-widgets.css',
})
export class LigaWidgets implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://v3.football.api-sports.io';

  // Clave del proyecto para consultar API-Football.
  protected readonly apiSportsKey = '5562c1bec63f5a3b4f43171bc1c158d9';
  protected readonly laLigaId = 140;
  protected readonly temporada = this.calcularTemporada();
  protected readonly zonaHoraria = 'Europe/Madrid';

  protected readonly cargando = signal(false);
  protected readonly error = signal('');
  protected readonly clasificacion = signal<ClasificacionFila[]>([]);
  protected readonly proximosPartidos = signal<Partido[]>([]);

  async ngOnInit(): Promise<void> {
    await this.cargarDatosLaLiga();
  }

  protected fechaPartido(fechaIso: string): string {
    return new Date(fechaIso).toLocaleString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private async cargarDatosLaLiga(): Promise<void> {
    this.cargando.set(true);
    this.error.set('');

    try {
      await Promise.all([this.cargarClasificacion(), this.cargarPartidos()]);
    } catch {
      this.error.set('No se pudieron cargar los datos de LaLiga. Revisa la API key o permisos CORS.');
    } finally {
      this.cargando.set(false);
    }
  }

  private calcularTemporada(): number {
    const hoy = new Date();
    return hoy.getMonth() >= 6 ? hoy.getFullYear() : hoy.getFullYear() - 1;
  }

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'x-apisports-key': this.apiSportsKey,
    });
  }

  private async cargarClasificacion(): Promise<void> {
    const url = `${this.baseUrl}/standings?league=${this.laLigaId}&season=${this.temporada}`;
    const data = await lastValueFrom(
      this.http.get<ApiSportsResponse<{ league: { standings: ClasificacionFila[][] } }>>(url, {
        headers: this.headers,
      }),
    );

    const tabla = data?.response?.[0]?.league?.standings?.[0] ?? [];
    this.clasificacion.set(tabla);
  }

  private async cargarPartidos(): Promise<void> {
    const url = `${this.baseUrl}/fixtures?league=${this.laLigaId}&season=${this.temporada}&next=10&timezone=${encodeURIComponent(this.zonaHoraria)}`;
    const data = await lastValueFrom(
      this.http.get<ApiSportsResponse<Partido>>(url, { headers: this.headers }),
    );

    this.proximosPartidos.set(data?.response ?? []);
  }
}
