import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService, PreLoginResponse } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  totpForm: FormGroup;

  // 'credenciales' = paso 1  |  'totp' = paso 2 (codigo 2FA)
  paso: 'credenciales' | 'totp' = 'credenciales';
  loading = false;
  error = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      correo:   ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.totpForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  // ── Paso 1: credenciales ───────────────────────────────────────────────────
  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.error   = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (resp) => {
        this.loading = false;
        if ('requires_2fa' in resp && resp.requires_2fa) {
          // Tiene 2FA activo: pasar al paso 2
          this.paso = 'totp';
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.error   = 'Credenciales incorrectas. Verifique su correo y contraseña.';
        this.loading = false;
      }
    });
  }

  // ── Paso 2: codigo TOTP ────────────────────────────────────────────────────
  onVerifyTOTP(): void {
    if (this.totpForm.invalid) return;
    this.loading = true;
    this.error   = '';

    this.authService.verifyTOTP(this.totpForm.value.codigo).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.error   = 'Código incorrecto o expirado. Intente de nuevo.';
        this.loading = false;
        this.totpForm.reset();
      }
    });
  }

  // ── Volver al paso 1 ───────────────────────────────────────────────────────
  volverAlLogin(): void {
    this.paso  = 'credenciales';
    this.error = '';
    this.totpForm.reset();
  }
}
