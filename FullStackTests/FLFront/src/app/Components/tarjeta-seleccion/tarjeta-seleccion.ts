import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Liga } from '../../interfaces/liga.interface';
import {EquipoligaService} from '../../Services/equipoliga.service';

// Tarjeta de liga con acción para seleccionar contexto y abrir modal.
@Component({
  selector: 'app-tarjeta-seleccion',
  imports: [RouterLink],
  templateUrl: './tarjeta-seleccion.html',
  styleUrl: './tarjeta-seleccion.css',
})
export class TarjetaSeleccion {
  @Input() liga!: Liga;

  @Output() abrirModal = new EventEmitter<void>();

  private equipoLigaService = inject(EquipoligaService);


  protected unirseLiga() {

    console.log("Click Card");
    this.equipoLigaService.setLiga(this.liga);

    this.abrirModal.emit();
  }
}
