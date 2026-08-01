import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
import { Inventario, InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatTableModule, MatIconModule, MatButtonModule, MatChipsModule,
    MatProgressSpinnerModule, MatTooltipModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent implements OnInit, OnDestroy {
  todoInventario: Inventario[] = [];
  inventario: Inventario[] = [];
  loading = true;
  error = '';
  displayedColumns = ['producto', 'stock_actual', 'stock_minimo', 'stock_maximo', 'ubicacion', 'estado'];
  pageIndex = 0;
  pageSize = 10;
  readonly pageSizeOptions = [10, 25, 50];

  // Filtros
  busqueda = '';
  soloCriticos = false;
  filtroUbicacion = '';
  ubicaciones: string[] = [];
  busquedaSubject = new Subject<string>();

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.busquedaSubject.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.aplicarFiltros());
    this.cargarInventario();
  }

  ngOnDestroy(): void { this.busquedaSubject.complete(); }

  cargarInventario(): void {
    this.loading = true;
    this.error = '';
    this.inventarioService.listar().subscribe({
      next: (data) => {
        this.todoInventario = data;
        this.ubicaciones = [...new Set(data.map(i => i.ubicacion_bodega).filter(u => !!u))] as string[];
        this.aplicarFiltros();
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el inventario';
        this.loading = false;
      }
    });
  }

  // ── Filtros ────────────────────────────────────────────────────────────────
  aplicarFiltros(): void {
    let resultado = this.todoInventario;
    if (this.busqueda.trim()) {
      const q = this.busqueda.toLowerCase();
      resultado = resultado.filter(i => i.nombre_producto.toLowerCase().includes(q));
    }
    if (this.soloCriticos) {
      resultado = resultado.filter(i => i.stock_actual < i.stock_minimo);
    }
    if (this.filtroUbicacion) {
      resultado = resultado.filter(i => i.ubicacion_bodega === this.filtroUbicacion);
    }
    this.inventario = resultado;
    this.pageIndex = 0;
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.soloCriticos = false;
    this.filtroUbicacion = '';
    this.inventario = this.todoInventario;
    this.pageIndex = 0;
  }

  get filtrosActivos(): boolean {
    return !!this.busqueda || this.soloCriticos || !!this.filtroUbicacion;
  }

  // ── Estado y colores ───────────────────────────────────────────────────────
  getEstado(item: Inventario): string {
    if (item.stock_actual === 0) return 'Sin stock';
    if (item.stock_actual < item.stock_minimo) return 'Critico';
    if (item.stock_actual <= item.stock_minimo * 1.5) return 'Bajo';
    return 'Normal';
  }

  getEstadoColor(item: Inventario): string {
    const estado = this.getEstado(item);
    switch (estado) {
      case 'Sin stock': return 'warn';
      case 'Critico': return 'warn';
      case 'Bajo': return 'accent';
      default: return 'primary';
    }
  }

  getPorcentajeStock(item: Inventario): number {
    return Math.min(Math.round((item.stock_actual / item.stock_maximo) * 100), 100);
  }

  getCriticos(): number {
    return this.todoInventario.filter(i => i.stock_actual < i.stock_minimo).length;
  }

  getNormales(): number {
    return this.todoInventario.filter(i => i.stock_actual >= i.stock_minimo).length;
  }

  get inventarioPaginado(): Inventario[] {
    const start = this.pageIndex * this.pageSize;
    return this.inventario.slice(start, start + this.pageSize);
  }

  cambiarPagina(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }
}
