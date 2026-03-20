import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-page404',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './page404.html',
  styleUrl: './page404.css',
})
export class Page404 {

}