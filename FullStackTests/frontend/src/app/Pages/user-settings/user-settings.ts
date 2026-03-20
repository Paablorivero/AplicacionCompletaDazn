import {Component, inject, OnInit, signal} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuariosService } from '../../Services/usuarios.service';
import { Userprofile } from '../../interfaces/dtos/userprofile.interface';
import { TranslatePipe } from '../../pipes/translate.pipe';

// TODO: Importar el servicio de usuario cuando esté listo
// import { UserService } from '../../services/user.service';

// TODO: Importar la interfaz de usuario
// import { IUser } from '../../interfaces/iuser';

@Component({
  selector: 'app-user-settings',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './user-settings.html',
  styleUrl: './user-settings.css',
})
export class UserSettings implements OnInit {

  private userService = inject(UsuariosService);

  profileForm: FormGroup;
  passwordForm: FormGroup;
  loadingProfile = false;
  profileError = '';
  private initialProfileValue: { username: string; email: string; birthDate: string | null } = {
    username: '',
    email: '',
    birthDate: null,
  };
  cambiosGuardadospopup = signal(false);


  constructor() {
    this.profileForm = new FormGroup({
      username:  new FormControl('', [Validators.required, Validators.minLength(3)]),
      email:     new FormControl('', [Validators.required, Validators.email]),
      birthDate: new FormControl(null, []),
    });

    this.passwordForm = new FormGroup({
      currentPassword: new FormControl(null, [Validators.required]),
      newPassword:     new FormControl(null, [Validators.required, Validators.minLength(8)]),
      confirmPassword: new FormControl(null, [Validators.required]),

      // TODO: Añadir validador personalizado a nivel de grupo para
      // comprobar que newPassword y confirmPassword coinciden
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadProfile();
  }

  get userInitials(): string {
    const username = this.profileForm.get('username')?.value as string;
    if (!username) return 'US';
    return username
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(word => word[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  }

  private async loadProfile(): Promise<void> {
    this.loadingProfile = true;
    this.profileError = '';

    try {
      const user: Userprofile = await this.userService.userProfile();
      const profileValue = {
        username: user.username ?? '',
        email: user.email ?? '',
        birthDate: this.toDateInputValue(user.fechaNacimiento),
      };

      this.profileForm.patchValue(profileValue);
      this.initialProfileValue = profileValue;
    } catch {
      this.profileError = 'No se pudo cargar la información del usuario.';
    } finally {
      this.loadingProfile = false;
    }
  }

  resetProfileForm(): void {
    this.profileForm.reset(this.initialProfileValue);
  }

  private toDateInputValue(dateValue: string | null | undefined): string | null {
    if (!dateValue) return null;

    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return dateValue.slice(0, 10);
    }

    return parsedDate.toISOString().split('T')[0];
  }

  async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) return;
    const { username, email, birthDate } = this.profileForm.value;
    try {
      await this.userService.updateProfile(username, email, birthDate);
      this.initialProfileValue = { username, email, birthDate };
      this.cambiosGuardadospopup.set(true);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
    }
  }


  updatePassword(): void {
    if (this.passwordForm.invalid) return;

    // TODO: Enviar cambio de contraseña al backend
    //
    // this.userService.updatePassword({
    //   currentPassword: this.passwordForm.value.currentPassword,
    //   newPassword:     this.passwordForm.value.newPassword,
    // }).subscribe(() => {
    //   alert('Contraseña actualizada correctamente');
    //   this.passwordForm.reset();
    // });

    console.log('Actualizar contraseña:', this.passwordForm.value);
  }

  deleteAccount(): void {
    // TODO: Mostrar modal de confirmación antes de llamar al backend
    //
    // this.userService.deleteAccount(this.userId).subscribe(() => {
    //   // Cerrar sesión y redirigir al login
    // });

    console.log('Eliminar cuenta');
  }

  checkControl(formGroup: FormGroup, formControlName: string, validator: string): boolean | undefined {
    return formGroup.get(formControlName)?.hasError(validator) &&
      formGroup.get(formControlName)?.touched;
  }
}
