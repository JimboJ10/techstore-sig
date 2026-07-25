import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ClientesService, Cliente, PedidoHistorial } from '../../services/clientes.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule,
    MatPaginatorModule
  ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  loading = true;
  loadingCrear = false;
  loadingHistorial = false;
  error = '';

  mostrarFormulario = false;
  clienteSeleccionado: Cliente | null = null;
  historial: PedidoHistorial[] = [];
  pageIndex = 0;
  pageSize = 10;
  historialPageIndex = 0;
  historialPageSize = 10;
  readonly pageSizeOptions = [10, 25, 50];

  nuevoClienteForm: FormGroup;
  displayedColumns = ['id_cliente', 'nombres', 'apellidos', 'correo', 'telefono', 'direccion', 'acciones'];
  displayedColumnsHistorial = ['id_pedido', 'fecha_pedido', 'estado', 'total'];

  constructor(
    private clientesService: ClientesService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.nuevoClienteForm = this.fb.group({
      nombres:   ['', Validators.required],
      apellidos: ['', Validators.required],
      correo:    ['', [Validators.email]],
      telefono:  [''],
      direccion: ['']
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading = true;
    this.error = '';
    this.clientesService.listar().subscribe({
      next: (data) => {
        this.clientes = data;
        this.pageIndex = 0;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los clientes';
        this.loading = false;
      }
    });
  }

  crearCliente(): void {
    if (this.nuevoClienteForm.invalid) return;
    this.loadingCrear = true;

    this.clientesService.crear(this.nuevoClienteForm.value).subscribe({
      next: (nuevo) => {
        this.clientes = [...this.clientes, nuevo];
        this.pageIndex = 0;
        this.snackBar.open(`Cliente ${nuevo.nombres} ${nuevo.apellidos} creado`, 'Cerrar', { duration: 3000 });
        this.mostrarFormulario = false;
        this.nuevoClienteForm.reset();
        this.loadingCrear = false;
      },
      error: (err) => {
        this.mostrarError(err?.error?.error || 'Error al crear el cliente');
        this.loadingCrear = false;
      }
    });
  }

  verHistorial(cliente: Cliente): void {
    if (this.clienteSeleccionado?.id_cliente === cliente.id_cliente) {
      // Toggle: ocultar si ya está abierto
      this.clienteSeleccionado = null;
      this.historial = [];
      return;
    }

    this.clienteSeleccionado = cliente;
    this.historial = [];
    this.historialPageIndex = 0;
    this.loadingHistorial = true;

    this.clientesService.historial(cliente.id_cliente).subscribe({
      next: (data) => {
        this.historial = data;
        this.loadingHistorial = false;
      },
      error: () => {
        this.mostrarError('No se pudo cargar el historial');
        this.loadingHistorial = false;
      }
    });
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.nuevoClienteForm.reset();
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Pagado':     return 'primary';
      case 'Despachado': return 'accent';
      case 'Entregado':  return 'primary';
      case 'Cancelado':  return 'warn';
      default:           return '';
    }
  }

  private mostrarError(msg: string): void {
    this.snackBar.open(msg, 'Cerrar', { duration: 4000, panelClass: 'snack-error' });
  }

  get clientesPaginados(): Cliente[] {
    const start = this.pageIndex * this.pageSize;
    return this.clientes.slice(start, start + this.pageSize);
  }

  get historialPaginado(): PedidoHistorial[] {
    const start = this.historialPageIndex * this.historialPageSize;
    return this.historial.slice(start, start + this.historialPageSize);
  }

  cambiarPagina(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  cambiarPaginaHistorial(event: PageEvent): void {
    this.historialPageIndex = event.pageIndex;
    this.historialPageSize = event.pageSize;
  }
}
