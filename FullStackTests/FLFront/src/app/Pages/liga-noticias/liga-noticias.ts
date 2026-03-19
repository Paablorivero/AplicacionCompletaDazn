import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NoticiasService } from '../../Services/noticias-service';
import { NoticiaInterface } from '../../interfaces/noticia-interface';
import { TarjetaNoticia } from '../../Components/tarjeta-noticia/tarjeta-noticia';
import { FormsModule } from '@angular/forms';

// Gestiona noticias, filtros y paginación para la portada de actualidad.
@Component({
  selector: 'app-liga-noticias',
  imports: [TarjetaNoticia, FormsModule, RouterLink],
  templateUrl: './liga-noticias.html',
  styleUrl: './liga-noticias.css',
})
export class LigaNoticias implements OnInit {
  private noticiasService = inject(NoticiasService);
  private router = inject(Router);

  todasLasNoticias = signal<NoticiaInterface[]>([]);
  cargando = signal(false);

  filtroFechaDesde = signal('');
  filtroFechaHasta = signal('');
  filtroSource = signal('');

  paginaActual = signal(1);
  noticiasPorPagina = 9;

  sourcesDisponibles = computed(() => {
    const names = this.todasLasNoticias().map(n => this.limpiarNombreSource(n.source.name));
    return [...new Set(names)].sort();
  });

  noticiasFiltradas = computed(() => {
    let noticias = this.todasLasNoticias();

    const source = this.filtroSource();
    if (source) {
      noticias = noticias.filter(n => this.limpiarNombreSource(n.source.name) === source);
    }

    return noticias;
  });

  totalPaginas = computed(() =>
    Math.ceil(this.noticiasFiltradas().length / this.noticiasPorPagina)
  );

  noticiasPaginadas = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.noticiasPorPagina;
    return this.noticiasFiltradas().slice(inicio, inicio + this.noticiasPorPagina);
  });

  paginasVisibles = computed(() => {
    const total = this.totalPaginas();
    const actual = this.paginaActual();
    const paginas: number[] = [];
    const rango = 2;

    for (let i = Math.max(1, actual - rango); i <= Math.min(total, actual + rango); i++) {
      paginas.push(i);
    }
    return paginas;
  });

  ngOnInit(): void {
    this.cargarNoticias();
  }

  cargarNoticias(): void {
    this.cargando.set(true);

    const from = this.filtroFechaDesde() || undefined;
    const to = this.filtroFechaHasta() || undefined;

    this.noticiasService.getAllNews(from, to).subscribe({
      next: (response) => {
        if (response.status !== 'ok') {
          this.router.navigate(['/page404']);
          return;
        }
        const articulosValidos = response.articles.filter(a => a.title !== '[Removed]');
        this.todasLasNoticias.set(articulosValidos);
        this.paginaActual.set(1);
        this.cargando.set(false);
      },
      error: () => {
        this.router.navigate(['/page404']);
      },
    });
  }

  irAPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas() && pagina !== this.paginaActual()) {
      this.paginaActual.set(pagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onFiltroFechaDesdeChange(valor: string): void {
    this.filtroFechaDesde.set(valor);
    this.cargarNoticias();
  }

  onFiltroFechaHastaChange(valor: string): void {
    this.filtroFechaHasta.set(valor);
    this.cargarNoticias();
  }

  onFiltroSourceChange(valor: string): void {
    this.filtroSource.set(valor);
    this.paginaActual.set(1);
  }

  limpiarFiltros(): void {
    this.filtroFechaDesde.set('');
    this.filtroFechaHasta.set('');
    this.filtroSource.set('');
    this.cargarNoticias();
  }

  hayFiltrosActivos(): boolean {
    return !!(this.filtroFechaDesde() || this.filtroFechaHasta() || this.filtroSource());
  }

  limpiarNombreSource(nombre: string): string {
    return nombre
      .replace(/^www\./i, '')
      .replace(/\.com$/i, '')
      .replace(/\.es$/i, '')
      .replace(/\.org$/i, '')
      .replace(/\.net$/i, '')
      .replace(/\.co$/i, '')
      .replace(/\.info$/i, '')
      .replace(/\.com.uy$/i, '')
      .replace(/\.com.mx$/i, '')
      .replace(/\.com.ar$/i, '')
      .replace(/\.com.br$/i, '')
      .replace(/\.com.cl$/i, '')
      .replace(/\.com.co$/i, '')
      .replace(/\.com.pe$/i, '')
      .replace(/\.com.ve$/i, '')
      .replace(/\.com.py$/i, '')
      .trim();
  }
}
