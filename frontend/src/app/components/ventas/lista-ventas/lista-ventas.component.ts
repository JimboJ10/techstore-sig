import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Pedido {
  id_pedido: number;
  id_cliente: number;
  id_empleado: number;
  fecha_pedido: string;
  estado: string;
  total: number;
  observaciones: string;
}

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
  displayedColumns = ['id_pedido', 'fecha_pedido', 'estado', 'total', 'acciones'];
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  cargarVentas(): void {
    this.loading = true;
    this.http.get<Pedido[]>(`${this.apiUrl}/ventas`,
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.ventas = data;
        this.loading = false;
      },
      error: () => this.loading = false
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