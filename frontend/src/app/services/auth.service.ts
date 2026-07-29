import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id_usuario: number;
  id_empleado: number;
  nombre_usuario: string;
  rol: string;
}

// Respuesta cuando el 2FA está activo — no incluye token final aún
export interface PreLoginResponse {
  requires_2fa: boolean;
  pre_token: string;
}

export interface Setup2FAResponse {
  qr_base64: string;  // PNG en base64
  secret: string;     // Clave para entrada manual en la app
}

export interface TwoFAStatus {
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  // ── Login paso 1: credenciales ─────────────────────────────────────────────
  // Retorna LoginResponse (sin 2FA) o PreLoginResponse (con 2FA activo).
  login(credentials: LoginRequest): Observable<LoginResponse | PreLoginResponse> {
    return this.http.post<LoginResponse | PreLoginResponse>(
      `${this.apiUrl}/auth/login`, credentials
    ).pipe(
      tap(response => {
        if ('requires_2fa' in response && response.requires_2fa) {
          // Guardar pre-token temporalmente en sessionStorage (dura 5 min)
          sessionStorage.setItem('pre_token', response.pre_token);
        } else {
          // Login completo: guardar en localStorage
          const r = response as LoginResponse;
          this.guardarSesion(r);
        }
      })
    );
  }

  // ── Login paso 2: verificar código TOTP ────────────────────────────────────
  verifyTOTP(codigo: string): Observable<LoginResponse> {
    const preToken = sessionStorage.getItem('pre_token') || '';
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/verify-2fa`,
      { pre_token: preToken, codigo_totp: codigo }
    ).pipe(
      tap(response => {
        sessionStorage.removeItem('pre_token');
        this.guardarSesion(response);
      })
    );
  }

  // ── Gestión 2FA ────────────────────────────────────────────────────────────
  get2FAStatus(): Observable<TwoFAStatus> {
    return this.http.get<TwoFAStatus>(`${this.apiUrl}/auth/2fa/status`);
  }

  setup2FA(): Observable<Setup2FAResponse> {
    return this.http.get<Setup2FAResponse>(`${this.apiUrl}/auth/2fa/setup`);
  }

  confirm2FA(codigo: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(
      `${this.apiUrl}/auth/2fa/confirm`,
      { codigo_totp: codigo }
    );
  }

  disable2FA(password: string, codigo: string): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(
      `${this.apiUrl}/auth/2fa/disable`,
      { password, codigo_totp: codigo }
    );
  }

  // ── Sesión ─────────────────────────────────────────────────────────────────
  private guardarSesion(r: LoginResponse): void {
    localStorage.setItem('token',       r.token);
    localStorage.setItem('id_usuario',  r.id_usuario.toString());
    localStorage.setItem('id_empleado', r.id_empleado.toString());
    localStorage.setItem('usuario',     r.nombre_usuario);
    localStorage.setItem('rol',         r.rol);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('id_usuario');
    localStorage.removeItem('id_empleado');
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    sessionStorage.removeItem('pre_token');
    this.router.navigate(['/login']);
  }

  getToken():      string | null { return localStorage.getItem('token');       }
  getUsuario():    string | null { return localStorage.getItem('usuario');     }
  getIdUsuario():  number | null { const v = localStorage.getItem('id_usuario');  return v ? +v : null; }
  getIdEmpleado(): number | null { const v = localStorage.getItem('id_empleado'); return v ? +v : null; }
  getRol():        string | null { return localStorage.getItem('rol');         }
  isLoggedIn():    boolean       { return !!this.getToken();                   }
}
