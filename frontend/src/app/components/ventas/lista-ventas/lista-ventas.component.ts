import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Pedido, VentasService } from '../../../services/ventas.service';

@Component({
  selector: 'app-lista-ventas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './lista-ventas.component.html',
  styleUrl: './lista-ventas.component.scss'
})
export class ListaVentasComponent implements OnInit, OnDestroy {
  todasVentas: Pedido[] = [];
  ventas: Pedido[] = [];
  loading = true;
  error = '';
  filtroActivo = 'Todos';
  displayedColumns = ['id_pedido', 'fecha_pedido', 'cliente', 'empleado', 'estado', 'estado_envio', 'total', 'acciones'];
  pageIndex = 0;
  pageSize = 10;
  readonly pageSizeOptions = [10, 25, 50];

  readonly filtros = ['Todos', 'Pagado', 'Despachado', 'Entregado', 'Cancelado'];

  busqueda = '';
  fechaDesde = '';
  fechaHasta = '';
  montoMin: number | null = null;
  montoMax: number | null = null;
  busquedaSubject = new Subject<string>();

  constructor(private ventasService: VentasService) {}

  ngOnInit(): void {
    this.cargarVentas();
    this.busquedaSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.aplicarFiltros());
  }

  ngOnDestroy(): void {
    this.busquedaSubject.complete();
  }

  cargarVentas(): void {
    this.loading = true;
    this.error = '';

    this.ventasService.listarVentas().subscribe({
      next: (data) => {
        this.todasVentas = data;
        this.aplicarFiltros();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las ventas';
        this.loading = false;
      }
    });
  }

  aplicarFiltro(estado: string): void {
    this.filtroActivo = estado;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let resultado = this.todasVentas;
    
    // Estado chip filter
    if (this.filtroActivo !== 'Todos') {
      resultado = resultado.filter(v => v.estado === this.filtroActivo);
    }
    
    // Text search: client or employee name
    if (this.busqueda.trim()) {
      const q = this.busqueda.toLowerCase();
      resultado = resultado.filter(v =>
        v.cliente.toLowerCase().includes(q) ||
        v.empleado.toLowerCase().includes(q)
      );
    }
    
    // Amount range
    if (this.montoMin !== null) {
      resultado = resultado.filter(v => v.total >= this.montoMin!);
    }
    if (this.montoMax !== null) {
      resultado = resultado.filter(v => v.total <= this.montoMax!);
    }
    
    this.ventas = resultado;
    this.pageIndex = 0;
  }

  limpiarFiltros(): void {
    this.filtroActivo = 'Todos';
    this.busqueda = '';
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.montoMin = null;
    this.montoMax = null;
    this.ventas = this.todasVentas;
    this.pageIndex = 0;
  }

  get filtrosActivos(): boolean {
    return this.filtroActivo !== 'Todos' || !!this.busqueda ||
      !!this.fechaDesde || !!this.fechaHasta ||
      this.montoMin !== null || this.montoMax !== null;
  }

  getTotalVentas(): number {
    return this.ventas.reduce((sum, v) => sum + v.total, 0);
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

  getEnvioColor(estado: string): string {
    switch (estado) {
      case 'Pendiente':       return 'warn';
      case 'En preparacion':  return 'accent';
      case 'Despachado':      return 'primary';
      case 'Entregado':       return 'primary';
      case 'Sin envio':       return '';
      default:                return '';
    }
  }

  contarPorEstado(estado: string): number {
    if (estado === 'Todos') return this.todasVentas.length;
    return this.todasVentas.filter(v => v.estado === estado).length;
  }

  get ventasPaginadas(): Pedido[] {
    const start = this.pageIndex * this.pageSize;
    return this.ventas.slice(start, start + this.pageSize);
  }

  cambiarPagina(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}

