import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { VentasService, PedidoDetalle } from '../../../services/ventas.service';

@Component({
  selector: 'app-detalle-venta',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './detalle-venta.component.html',
  styleUrl: './detalle-venta.component.scss'
})
export class DetalleVentaComponent implements OnInit {
  pedido: PedidoDetalle | null = null;
  loading = true;
  loadingAccion = false;
  error = '';

  private idPedido = 0;

  constructor(
    private route: ActivatedRoute,
    private ventasService: VentasService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.idPedido = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarDetalle();
  }

  cargarDetalle(): void {
    this.loading = true;
    this.error = '';

    this.ventasService.detalleVenta(this.idPedido).subscribe({
      next: (data) => {
        this.pedido = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el detalle del pedido';
        this.loading = false;
      }
    });
  }

  marcarEntregado(): void {
    if (!this.pedido) return;

    this.loadingAccion = true;
    this.ventasService.marcarEntregado(this.idPedido).subscribe({
      next: (res) => {
        this.snackBar.open(res.mensaje, 'Cerrar', { duration: 3000 });
        this.cargarDetalle();
        this.loadingAccion = false;
      },
      error: (err) => {
        this.snackBar.open(err?.error?.error || 'No se pudo entregar el pedido', 'Cerrar', { duration: 4000 });
        this.loadingAccion = false;
      }
    });
  }

  puedeEntregar(): boolean {
    return !!this.pedido && (this.pedido.estado === 'Despachado' || this.pedido.estado === 'Pagado');
  }
}