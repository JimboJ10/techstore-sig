import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService, Setup2FAResponse } from '../../services/auth.service';

type Vista = 'info' | 'activar-qr' | 'activar-confirm' | 'desactivar';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
  ],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit {
  usuario   = '';
  rol       = '';
  correo    = '';

  // Estado 2FA
  twoFAActivo = false;
  cargando    = false;

  // Vista interna de la sección 2FA
  vista: Vista = 'info';

  // Setup
  qrData: Setup2FAResponse | null = null;
  confirmForm: FormGroup;

  // Desactivar
  disableForm: FormGroup;

  // Mensajes
  mensajeOk  = '';
  mensajeErr = '';

  hidePassword = true;

  constructor(private authService: AuthService, private fb: FormBuilder) {
    this.confirmForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
    this.disableForm = this.fb.group({
      password: ['', Validators.required],
      codigo:   ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  ngOnInit(): void {
    this.usuario = this.authService.getUsuario() || '';
    this.rol     = this.authService.getRol()     || '';
    this.cargando = true;
    this.authService.get2FAStatus().subscribe({
      next: (s) => { this.twoFAActivo = s.activo; this.cargando = false; },
      error: ()  => { this.cargando = false; }
    });
  }

  // ── Activar 2FA: paso 1 — obtener QR ──────────────────────────────────────
  iniciarActivacion(): void {
    this.limpiarMensajes();
    this.cargando = true;
    this.authService.setup2FA().subscribe({
      next: (data) => {
        this.qrData  = data;
        this.vista   = 'activar-qr';
        this.cargando = false;
      },
      error: () => {
        this.mensajeErr = 'Error al generar la configuración. Intenta de nuevo.';
        this.cargando = false;
      }
    });
  }

  // ── Activar 2FA: paso 2 — confirmar código ────────────────────────────────
  pasarAConfirmar(): void {
    this.vista = 'activar-confirm';
    this.confirmForm.reset();
    this.limpiarMensajes();
  }

  confirmarActivacion(): void {
    if (this.confirmForm.invalid) return;
    this.limpiarMensajes();
    this.cargando = true;
    this.authService.confirm2FA(this.confirmForm.value.codigo).subscribe({
      next: () => {
        this.twoFAActivo = true;
        this.vista       = 'info';
        this.mensajeOk   = '¡2FA activado correctamente! Ahora se te pedirá el código en cada inicio de sesión.';
        this.cargando    = false;
      },
      error: (err) => {
        this.mensajeErr = err?.error?.error || 'Código incorrecto. Verifica tu app de autenticación.';
        this.cargando   = false;
      }
    });
  }

  // ── Desactivar 2FA ────────────────────────────────────────────────────────
  abrirDesactivar(): void {
    this.vista = 'desactivar';
    this.disableForm.reset();
    this.limpiarMensajes();
  }

  confirmarDesactivacion(): void {
    if (this.disableForm.invalid) return;
    this.limpiarMensajes();
    this.cargando = true;
    const { password, codigo } = this.disableForm.value;
    this.authService.disable2FA(password, codigo).subscribe({
      next: () => {
        this.twoFAActivo = false;
        this.vista       = 'info';
        this.mensajeOk   = '2FA desactivado. Tu cuenta ya no requiere código de verificación.';
        this.cargando    = false;
      },
      error: (err) => {
        this.mensajeErr = err?.error?.error || 'Verificación fallida. Revisa tu contraseña y el código.';
        this.cargando   = false;
      }
    });
  }

  cancelar(): void {
    this.vista = 'info';
    this.limpiarMensajes();
    this.confirmForm.reset();
    this.disableForm.reset();
  }

  private limpiarMensajes(): void {
    this.mensajeOk  = '';
    this.mensajeErr = '';
  }
}
