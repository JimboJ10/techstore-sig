import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { BpmService, ProcesoBPM, Proveedor } from '../../../services/bpm.service';
import { Producto } from '../../../services/ventas.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-lista-bpm',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule,
    MatCardModule, MatTableModule, MatIconModule, MatButtonModule, MatChipsModule,
    MatProgressSpinnerModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSnackBarModule, MatTooltipModule, MatPaginatorModule
  ],
  templateUrl: './lista-bpm.component.html',
  styleUrl: './lista-bpm.component.scss'
})
export class ListaBpmComponent implements OnInit, OnDestroy {
  todosProcesos: ProcesoBPM[] = [];
  procesos: ProcesoBPM[] = [];
  loading = true;
  loadingAccion = false;
  mostrarFormulario = false;
  error = '';
  pageIndex = 0;
  pageSize = 10;
  readonly pageSizeOptions = [10, 25, 50];

  // Filtros
  busqueda = '';
  filtroEstado = '';
  filtroProveedor: number | null = null;
  busquedaSubject = new Subject<string>();

  nuevaOrdenForm: FormGroup;
  productos: Producto[] = [];
  proveedores: Proveedor[] = [];

  displayedColumns = ['id_proceso', 'producto', 'proveedor', 'cantidad',
                      'estado', 'fecha_inicio', 'tipo', 'acciones'];

  readonly estadosBPM = ['Generado', 'Aprobado', 'Enviado', 'Recibido', 'Cancelado'];

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
    this.busquedaSubject.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.aplicarFiltros());
    this.cargarProcesos();
    this.cargarProductos();
    this.cargarProveedores();
  }

  ngOnDestroy(): void { this.busquedaSubject.complete(); }

  cargarProcesos(): void {
    this.loading = true;
    this.error = '';
    this.bpmService.listarProcesos().subscribe({
      next: (data) => {
        this.todosProcesos = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: () => { this.error = 'No se pudieron cargar los procesos BPM'; this.loading = false; }
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

  // ── Filtros ────────────────────────────────────────────────────────────────
  aplicarFiltros(): void {
    let resultado = this.todosProcesos;

    if (this.busqueda.trim()) {
      const q = this.busqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.nombre_producto.toLowerCase().includes(q) ||
        p.nombre_proveedor.toLowerCase().includes(q)
      );
    }

    if (this.filtroEstado) {
      resultado = resultado.filter(p => p.estado_proceso === this.filtroEstado);
    }

    if (this.filtroProveedor) {
      resultado = resultado.filter(p => p.id_proveedor === this.filtroProveedor);
    }

    this.procesos = resultado;
    this.pageIndex = 0;
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroEstado = '';
    this.filtroProveedor = null;
    this.procesos = this.todosProcesos;
    this.pageIndex = 0;
  }

  get filtrosActivos(): boolean {
    return !!this.busqueda || !!this.filtroEstado || !!this.filtroProveedor;
  }

  // ── Acciones ───────────────────────────────────────────────────────────────
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
      error: (err) => { this.mostrarError(err?.error?.error || 'Error al generar la orden'); this.loadingAccion = false; }
    });
  }

  aprobar(idProceso: number): void {
    this.loadingAccion = true;
    this.bpmService.aprobar(idProceso).subscribe({
      next: () => { this.snackBar.open('Proceso aprobado exitosamente', 'Cerrar', { duration: 3000 }); this.cargarProcesos(); this.loadingAccion = false; },
      error: (err) => { this.mostrarError(err?.error?.error || 'Error al aprobar'); this.loadingAccion = false; }
    });
  }

  recibir(idProceso: number): void {
    this.loadingAccion = true;
    this.bpmService.recibir(idProceso).subscribe({
      next: () => { this.snackBar.open('Mercaderia recibida, inventario actualizado', 'Cerrar', { duration: 3000 }); this.cargarProcesos(); this.loadingAccion = false; },
      error: (err) => { this.mostrarError(err?.error?.error || 'Error al confirmar recepcion'); this.loadingAccion = false; }
    });
  }

  puedeGenerar(): boolean { return this.tieneRol(['Gerente', 'Administrador']); }
  puedeAprobar(): boolean { return this.tieneRol(['Gerente']); }
  puedeRecibir(): boolean { return this.tieneRol(['Gerente', 'Bodeguero']); }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Generado': return 'warn';
      case 'Aprobado': return 'accent';
      case 'Enviado':  return 'primary';
      case 'Recibido': return 'primary';
      case 'Cancelado': return 'warn';
      default: return '';
    }
  }

  getPendientes(): number { return this.todosProcesos.filter(p => p.estado_proceso === 'Generado').length; }
  getAprobados(): number  { return this.todosProcesos.filter(p => p.estado_proceso === 'Aprobado').length; }

  private tieneRol(roles: string[]): boolean { return roles.includes(this.authService.getRol() || ''); }
  private mostrarError(mensaje: string): void { this.snackBar.open(mensaje, 'Cerrar', { duration: 4000, panelClass: 'snack-error' }); }

  get procesosPaginados(): ProcesoBPM[] {
    const start = this.pageIndex * this.pageSize;
    return this.procesos.slice(start, start + this.pageSize);
  }

  cambiarPagina(event: PageEvent): void { this.pageIndex = event.pageIndex; this.pageSize = event.pageSize; }
}


