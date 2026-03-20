import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { RegisterForm } from '../../interfaces/register-request.interface';
import { AuthServiceService } from '../../Services/auth-service.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, ReactiveFormsModule, TranslatePipe],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  userForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  notificationType: 'success' | 'error' | null = null;
  notificationMessage = '';
  private authService = inject(AuthServiceService);
  private router = inject(Router);

  constructor() {
    this.userForm = new FormGroup(
      {
        username: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),

        //Validacion de contraseña - Minimo 8 caracteres, maximo 12 caracteres, al menos una letra mayúscula y al menos un carácter especial
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(12),
          Validators.pattern(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/),
        ]),
        confirmPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(12),
        ]),

        fechaNacimiento: new FormControl('', [Validators.required]),
      },

      //Validacion de confirmacion de contraseña - Deben ser iguales
      {
        validators: (form: AbstractControl) => {
          const password = form.get('password')?.value;
          const confirmPassword = form.get('confirmPassword')?.value;
          if (!password || !confirmPassword) {
            return null;
          }
          return password === confirmPassword ? null : { passwordMismatch: true };
        },
      },
    );
  }

  isSubmitting = false;

  async getDataForm() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.notificationType = null;
    this.notificationMessage = '';

    const formValue = this.userForm.value;
    const userData: RegisterForm = {
      username: (formValue.username as string).trim(),
      email: (formValue.email as string).trim(),
      password: formValue.password as string,
      fechaNacimiento: new Date(formValue.fechaNacimiento as string),
    };

    try {
      await this.authService.registerUser(userData);
      this.notificationType = 'success';
      this.notificationMessage = 'Cuenta creada correctamente.';
      this.userForm.reset();
      setTimeout(() => this.router.navigate(['/daznfantasy/login']), 1200);
    } catch (error: unknown) {
      this.notificationType = 'error';
      if (error instanceof Object && 'error' in error) {
        const httpErr = error as { error?: { error?: string }, status?: number };
        if (httpErr.status === 0) {
          this.notificationMessage = 'No se puede conectar con el servidor.';
        } else if (httpErr.error?.error) {
          this.notificationMessage = httpErr.error.error;
        } else {
          this.notificationMessage = 'No se pudo crear la cuenta. Inténtalo de nuevo.';
        }
      } else {
        this.notificationMessage = 'Error inesperado al crear la cuenta.';
      }
    } finally {
      this.isSubmitting = false;
    }
  }
}