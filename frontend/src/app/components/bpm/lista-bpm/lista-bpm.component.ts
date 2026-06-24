import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

interface ProcesoBPM {
  id_proceso: number;
  id_proveedor: number;
  id_producto: number;
  nombre_producto: string;
  nombre_proveedor: string;
  cantidad_solicitada: number;
  estado_proceso: string;
  fecha_inicio: string;
  fecha_aprobacion: string;
  fecha_recepcion: string;
  activado_automaticamente: number;
}

@Component({
  selector: 'app-lista-bpm',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './lista-bpm.component.html',
  styleUrl: './lista-bpm.component.scss'
})
export class ListaBpmComponent implements OnInit {
  procesos: ProcesoBPM[] = [];
  loading = true;
  loadingAccion = false;
  mostrarFormulario = false;

  nuevaOrdenForm: FormGroup;
  productos: any[] = [];
  proveedores: any[] = [];

  displayedColumns = ['id_proceso', 'producto', 'proveedor', 'cantidad',
                      'estado', 'fecha_inicio', 'tipo', 'acciones'];
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.nuevaOrdenForm = this.fb.group({
      id_proveedor: ['', Validators.required],
      id_producto: ['', Validators.required],
      cantidad_solicitada: [10, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.cargarProcesos();
    this.cargarProductos();
    this.cargarProveedores();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  cargarProcesos(): void {
    this.loading = true;
    this.http.get<ProcesoBPM[]>(`${this.apiUrl}/procesos-bpm`,
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.procesos = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  cargarProductos(): void {
    this.http.get<any[]>(`${this.apiUrl}/productos`,
      { headers: this.getHeaders() }).subscribe({
      next: (data) => this.productos = data
    });
  }

  cargarProveedores(): void {
    this.http.get<any[]>(`${this.apiUrl}/proveedores`,
      { headers: this.getHeaders() }).subscribe({
      next: (data) => this.proveedores = data,
      error: () => {
        this.proveedores = [
          { id_proveedor: 1, razon_social: 'TechDistrib S.A.' },
          { id_proveedor: 2, razon_social: 'Global Tech Ecuador' }
        ];
      }
    });
  }

  generarOrden(): void {
    if (this.nuevaOrdenForm.invalid) return;
    this.loadingAccion = true;

    this.http.post(`${this.apiUrl}/procesos-bpm`,
      this.nuevaOrdenForm.value,
      { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.snackBar.open('✅ Orden de compra generada', 'Cerrar', { duration: 3000 });
        this.mostrarFormulario = false;
        this.nuevaOrdenForm.reset({ cantidad_solicitada: 10 });
        this.cargarProcesos();
        this.loadingAccion = false;
      },
      error: () => {
        this.snackBar.open('❌ Error al generar la orden', 'Cerrar', { duration: 3000 });
        this.loadingAccion = false;
      }
    });
  }

  aprobar(idProceso: number): void {
    this.loadingAccion = true;
    this.http.put(`${this.apiUrl}/procesos-bpm/${idProceso}/aprobar`,
      { id_empleado: 1 },
      { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.snackBar.open('✅ Proceso aprobado exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarProcesos();
        this.loadingAccion = false;
      },
      error: () => {
        this.snackBar.open('❌ Error al aprobar', 'Cerrar', { duration: 3000 });
        this.loadingAccion = false;
      }
    });
  }

  recibir(idProceso: number): void {
    this.loadingAccion = true;
    this.http.put(`${this.apiUrl}/procesos-bpm/${idProceso}/recibir`,
      {},
      { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.snackBar.open('✅ Mercadería recibida, inventario actualizado', 'Cerrar', { duration: 3000 });
        this.cargarProcesos();
        this.loadingAccion = false;
      },
      error: () => {
        this.snackBar.open('❌ Error al confirmar recepción', 'Cerrar', { duration: 3000 });
        this.loadingAccion = false;
      }
    });
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Generado': return 'warn';
      case 'Aprobado': return 'accent';
      case 'Enviado': return 'primary';
      case 'Recibido': return 'primary';
      case 'Cancelado': return 'warn';
      default: return '';
    }
  }

  getPendientes(): number {
    return this.procesos.filter(p => p.estado_proceso === 'Generado').length;
  }

  getAprobados(): number {
    return this.procesos.filter(p => p.estado_proceso === 'Aprobado').length;
  }
}