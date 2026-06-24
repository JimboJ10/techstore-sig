import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

interface Inventario {
  id_inventario: number;
  id_producto: number;
  nombre_producto: string;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  ubicacion_bodega: string;
}

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
    MatTooltipModule
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent implements OnInit {
  inventario: Inventario[] = [];
  loading = true;
  displayedColumns = ['producto', 'stock_actual', 'stock_minimo', 'stock_maximo', 'ubicacion', 'estado'];
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarInventario();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  cargarInventario(): void {
    this.loading = true;
    this.http.get<Inventario[]>(`${this.apiUrl}/inventario`,
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.inventario = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getEstado(item: Inventario): string {
    if (item.stock_actual === 0) return 'Sin stock';
    if (item.stock_actual < item.stock_minimo) return 'Crítico';
    if (item.stock_actual <= item.stock_minimo * 1.5) return 'Bajo';
    return 'Normal';
  }

  getEstadoColor(item: Inventario): string {
    const estado = this.getEstado(item);
    switch (estado) {
      case 'Sin stock': return 'warn';
      case 'Crítico': return 'warn';
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
}