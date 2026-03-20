import {Component, inject} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {FormsModule, NgForm} from '@angular/forms';
import {Userlogin} from '../../interfaces/userlogin.interface';
import {AuthServiceService} from '../../Services/auth-service.service';
import {HttpErrorResponse} from '@angular/common/http';
import {TranslatePipe} from '../../pipes/translate.pipe';

@Component({
  selector: 'app-log-in',
  imports: [RouterLink, FormsModule, TranslatePipe],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn {

  passwordVisible = false;
  loginError = '';
  isSubmitting = false;

  protected loginData: Userlogin = {
    username: '',
    password: '',
  };

  private authService = inject(AuthServiceService);
  private router = inject(Router);

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  protected async onSubmit(loginForm: NgForm) {
    if (!this.loginData.username.trim() || !this.loginData.password.trim()) {
      this.loginError = 'Introduce usuario y contraseña';
      return;
    }

    this.loginError = '';
    this.isSubmitting = true;

    try {
      await this.authService.loginUser({
        username: this.loginData.username.trim(),
        password: this.loginData.password,
      });

      await this.router.navigate(['/daznfantasy/home']);
    } catch (error) {
      this.passwordVisible = false;
      loginForm.resetForm({ username: this.loginData.username, password: '' });

      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
          this.loginError = 'No se puede conectar con el servidor';
        } else if (error.error?.error) {
          this.loginError = error.error.error;
        } else {
          this.loginError = 'Usuario o contraseña incorrectos';
        }
      } else {
        this.loginError = 'Error inesperado al iniciar sesión';
      }
    } finally {
      this.isSubmitting = false;
    }
  }
}
