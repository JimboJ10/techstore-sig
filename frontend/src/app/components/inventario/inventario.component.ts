import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Inventario, InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent implements OnInit {
  inventario: Inventario[] = [];
  loading = true;
  error = '';
  displayedColumns = ['producto', 'stock_actual', 'stock_minimo', 'stock_maximo', 'ubicacion', 'estado'];
  pageIndex = 0;
  pageSize = 10;
  readonly pageSizeOptions = [10, 25, 50];

  constructor(private inventarioService: InventarioService) {}

  ngOnInit(): void {
    this.cargarInventario();
  }

  cargarInventario(): void {
    this.loading = true;
    this.error = '';

    this.inventarioService.listar().subscribe({
      next: (data) => {
        this.inventario = data;
        this.pageIndex = 0;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el inventario';
        this.loading = false;
      }
    });
  }

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
    return this.inventario.filter(i => i.stock_actual < i.stock_minimo).length;
  }

  getNormales(): number {
    return this.inventario.filter(i => i.stock_actual >= i.stock_minimo).length;
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
