import {Component, Input} from '@angular/core';
import {JugadorResumenDto} from '../../interfaces/dtos/jugadorresumendto';

// Muestra un jugador y traduce su posición larga a etiqueta corta.
@Component({
  selector: 'app-jugador-alineacion',
  standalone: true,
  templateUrl: './jugador-alineacion.component.html',
  styleUrl: './jugador-alineacion.component.css',
})
export class JugadorAlineacionComponent {
  @Input() jugador!: JugadorResumenDto;
  @Input() selected: boolean = false;

  get posicionLabel(): string {
    const labels: Record<string, string> = {
      Goalkeeper: 'POR',
      Defender: 'DEF',
      Midfielder: 'MED',
      Attacker: 'DEL'
    };

    return labels[this.jugador?.posicion] ?? this.jugador?.posicion ?? '';
  }
}
