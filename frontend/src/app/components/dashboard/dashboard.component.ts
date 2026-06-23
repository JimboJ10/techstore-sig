import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

Chart.register(...registerables);

interface KPIs {
  total_ventas_mes: number;
  cantidad_pedidos: number;
  productos_criticos: number;
  pedidos_pendientes: number;
  tiempo_promedio_despacho: number;
  bpm_pendientes: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatBadgeModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  @ViewChild('ventasChart') ventasChartRef!: ElementRef;
  @ViewChild('productosChart') productosChartRef!: ElementRef;

  kpis: KPIs | null = null;
  loading = true;
  private apiUrl = environment.apiUrl;
  private charts: Chart[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  ngOnInit(): void {
    this.cargarKPIs();
  }

  ngOnDestroy(): void {
    this.charts.forEach(chart => chart.destroy());
  }

  cargarKPIs(): void {
    this.http.get<KPIs>(`${this.apiUrl}/dashboard/kpis`,
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.kpis = data;
        this.loading = false;
        // Esperamos que el DOM se actualice después de mostrar los KPIs
        setTimeout(() => this.cargarGraficos(), 100);
      },
      error: () => this.loading = false
    });
  }

  cargarGraficos(): void {
    this.http.get<any[]>(`${this.apiUrl}/dashboard/ventas-periodo`,
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        if (!this.ventasChartRef) return;
        const chart1 = new Chart(this.ventasChartRef.nativeElement, {
          type: 'line',
          data: {
            labels: data.map(v => v.fecha),
            datasets: [{
              label: 'Ventas ($)',
              data: data.map(v => v.total),
              borderColor: '#1565c0',
              backgroundColor: 'rgba(21,101,192,0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: true } }
          }
        });
        this.charts.push(chart1);
      }
    });
  
    this.http.get<any[]>(`${this.apiUrl}/dashboard/productos-top`,
      { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        if (!this.productosChartRef) return;
        const chart2 = new Chart(this.productosChartRef.nativeElement, {
          type: 'bar',
          data: {
            labels: data.map(p => p.nombre_producto),
            datasets: [{
              label: 'Unidades vendidas',
              data: data.map(p => p.total_vendido),
              backgroundColor: [
                '#1565c0', '#1976d2', '#1e88e5', '#2196f3', '#42a5f5'
              ]
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } }
          }
        });
        this.charts.push(chart2);
      }
    });
  }
}