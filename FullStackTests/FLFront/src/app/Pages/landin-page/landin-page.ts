import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthServiceService } from '../../Services/auth-service.service';
import {TemporadaService} from '../../Services/temporada.service';

@Component({
  selector: 'app-landin-page',
  imports: [
    RouterLink
  ],
  templateUrl: './landin-page.html',
  styleUrl: './landin-page.css',
})
export class LandinPage implements OnInit {

//   Inyecto el servicio de temporadaservice para que obtenga la temporada al arrancar.
  tempService = inject(TemporadaService);
  private authService = inject(AuthServiceService);
  private router = inject(Router);

  ngOnInit(): void {
    if (this.authService.getToken()) {
      this.router.navigate(['/daznfantasy/home']);
    }
  }
}
