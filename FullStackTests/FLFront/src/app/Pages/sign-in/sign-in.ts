import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { RegisterForm } from '../../interfaces/register-request.interface';
import { AuthServiceService } from '../../Services/auth-service.service';

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, ReactiveFormsModule],
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

  async getDataForm() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formValue = this.userForm.value;
    const userData: RegisterForm = {
      username: formValue.username as string,
      email: formValue.email as string,
      password: formValue.password as string,
      fechaNacimiento: new Date(formValue.fechaNacimiento as string),
    };

    try {
      await this.authService.registerUser(userData);
      this.notificationType = 'success';
      this.notificationMessage = 'Cuenta creada correctamente.';
      this.userForm.reset();
      setTimeout(() => this.router.navigate(['/daznfantasy/login']), 1200);
    } catch {
      this.notificationType = 'error';
      this.notificationMessage = 'No se pudo crear la cuenta. Intentalo de nuevo.';
    }
  }
}