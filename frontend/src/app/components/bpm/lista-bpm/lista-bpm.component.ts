import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BpmService, ProcesoBPM, Proveedor } from '../../../services/bpm.service';
import { Producto } from '../../../services/ventas.service';
import { AuthService } from '../../../services/auth.service';

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
  error = '';

  nuevaOrdenForm: FormGroup;
  productos: Producto[] = [];
  proveedores: Proveedor[] = [];

  displayedColumns = ['id_proceso', 'producto', 'proveedor', 'cantidad',
                      'estado', 'fecha_inicio', 'tipo', 'acciones'];

  constructor(
    private bpmService: BpmService,
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

  cargarProcesos(): void {
    this.loading = true;
    this.error = '';

    this.bpmService.listarProcesos().subscribe({
      next: (data) => {
        this.procesos = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los procesos BPM';
        this.loading = false;
      }
    });
  }

  cargarProductos(): void {
    this.bpmService.listarProductos().subscribe({
      next: (data) => this.productos = data,
      error: () => this.mostrarError('No se pudieron cargar los productos')
    });
  }

  cargarProveedores(): void {
    this.bpmService.listarProveedores().subscribe({
      next: (data) => this.proveedores = data,
      error: () => this.mostrarError('No se pudieron cargar los proveedores')
    });
  }

  generarOrden(): void {
    if (this.nuevaOrdenForm.invalid) return;
    this.loadingAccion = true;

    this.bpmService.generarOrden(this.nuevaOrdenForm.value).subscribe({
      next: () => {
        this.snackBar.open('Orden de compra generada', 'Cerrar', { duration: 3000 });
        this.mostrarFormulario = false;
        this.nuevaOrdenForm.reset({ cantidad_solicitada: 10 });
        this.cargarProcesos();
        this.loadingAccion = false;
      },
      error: (err) => {
        this.mostrarError(err?.error?.error || 'Error al generar la orden');
        this.loadingAccion = false;
      }
    });
  }

  aprobar(idProceso: number): void {
    this.loadingAccion = true;

    this.bpmService.aprobar(idProceso).subscribe({
      next: () => {
        this.snackBar.open('Proceso aprobado exitosamente', 'Cerrar', { duration: 3000 });
        this.cargarProcesos();
        this.loadingAccion = false;
      },
      error: (err) => {
        this.mostrarError(err?.error?.error || 'Error al aprobar');
        this.loadingAccion = false;
      }
    });
  }

  recibir(idProceso: number): void {
    this.loadingAccion = true;

    this.bpmService.recibir(idProceso).subscribe({
      next: () => {
        this.snackBar.open('Mercaderia recibida, inventario actualizado', 'Cerrar', { duration: 3000 });
        this.cargarProcesos();
        this.loadingAccion = false;
      },
      error: (err) => {
        this.mostrarError(err?.error?.error || 'Error al confirmar recepcion');
        this.loadingAccion = false;
      }
    });
  }

  puedeGenerar(): boolean {
    return this.tieneRol(['Gerente', 'Administrador']);
  }

  puedeAprobar(): boolean {
    return this.tieneRol(['Gerente']);
  }

  puedeRecibir(): boolean {
    return this.tieneRol(['Gerente', 'Bodeguero']);
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

  private tieneRol(roles: string[]): boolean {
    return roles.includes(this.authService.getRol() || '');
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 4000, panelClass: 'snack-error' });
  }
}
