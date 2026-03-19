import { Component, input } from '@angular/core';
import { NoticiaInterface } from '../../interfaces/noticia-interface';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

// Renderiza una noticia y normaliza el nombre del medio para mostrarlo limpio.
@Component({
  selector: 'app-tarjeta-noticia',
  imports: [DatePipe, TranslatePipe],
  templateUrl: './tarjeta-noticia.html',
  styleUrl: './tarjeta-noticia.css',
})
export class TarjetaNoticia {
  noticia = input.required<NoticiaInterface>();

  get imagenFallback(): string {
    return 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?q=80&w=800&auto=format&fit=crop';
  }

  get nombreSource(): string {
    return this.noticia().source.name
      .replace(/^www\./i, '')
      .replace(/\.com$/i, '')
      .replace(/\.es$/i, '')
      .replace(/\.org$/i, '')
      .replace(/\.net$/i, '')
      .replace(/\.co$/i, '')
      .replace(/\.info$/i, '')
      .trim();
  }

  abrirNoticia(): void {
    window.open(this.noticia().url, '_blank');
  }
}
