import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Pedido, VentasService } from '../../../services/ventas.service';

@Component({
  selector: 'app-lista-ventas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './lista-ventas.component.html',
  styleUrl: './lista-ventas.component.scss'
})
export class ListaVentasComponent implements OnInit {
  ventas: Pedido[] = [];
  loading = true;
  error = '';
  displayedColumns = ['id_pedido', 'fecha_pedido', 'estado', 'total', 'acciones'];

  constructor(private ventasService: VentasService) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.loading = true;
    this.error = '';

    this.ventasService.listarVentas().subscribe({
      next: (data) => {
        this.ventas = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las ventas';
        this.loading = false;
      }
    });
  }

  getTotalVentas(): number {
    return this.ventas.reduce((sum, v) => sum + v.total, 0);
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Pagado': return 'primary';
      case 'Despachado': return 'accent';
      case 'Entregado': return 'primary';
      case 'Cancelado': return 'warn';
      default: return '';
    }
  }
}
