import {Component, inject} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {FormsModule, NgForm} from '@angular/forms';
import {Userlogin} from '../../interfaces/userlogin.interface';
import {AuthServiceService} from '../../Services/auth-service.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-log-in',
  imports: [RouterLink, FormsModule],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn {

  passwordVisible: boolean = false;
  loginError: string = '';
  isSubmitting: boolean = false;

  // Defino la propiedad del formulario
  protected loginData: Userlogin;

  // Inyecto el authService

  private authService = inject(AuthServiceService);

  // Inyecto el servicio Router
  private router: Router = inject(Router);

  constructor(){
    // Inicializo la propiedad loginData
    this.loginData = {
      username: '',
      password: '',
    };
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  protected async onSubmit(loginForm: NgForm) {
    this.loginError = '';
    this.isSubmitting = true;

    const payload: Userlogin = {
      username: this.loginData.username,
      password: this.loginData.password,
    };

    try {
      await this.authService.loginUser(payload);

      this.router.navigate(['/daznfantasy/home']);

      console.log('log in successfully');

    } catch (error) {
      loginForm.resetForm({
        username: '',
        password: '',
      });
      this.passwordVisible = false;

      if (error instanceof HttpErrorResponse && error.error?.error) {
        this.loginError = error.error.error;
      } else {
        this.loginError = 'Usuario o contraseña incorrectos';
      }

      console.log('login failed');
    } finally {
      this.isSubmitting = false;
    }
  }
}
