import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Chart, registerables, ChartConfiguration } from 'chart.js';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  DashboardService,
  KPIs, VentaMes, VentaAnio, VentaEmpleado,
  ProductoTop, PedidoEstado, TicketMes, VentaCategoria,
  ComparacionPeriodo, EmpleadoFiltro, FiltrosDashboard,
  MESES_NOMBRE
} from '../../services/dashboard.service';

Chart.register(...registerables);

// ─── Paletas de colores ──────────────────────────────────────────────────────
const PALETTE_MULTI = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#ef4444', '#14b8a6', '#f97316', '#84cc16'
];

const ESTADO_COLORS: Record<string, string> = {
  'Pendiente':       '#f59e0b',
  'Pagado':          '#3b82f6',
  'En preparacion':  '#8b5cf6',
  'Despachado':      '#14b8a6',
  'Entregado':       '#10b981',
  'Cancelado':       '#ef4444'
};

// ─── Años disponibles para filtro ───────────────────────────────────────────
function generarAnios(): string[] {
  const actual = new Date().getFullYear();
  return [actual, actual - 1, actual - 2, actual - 3].map(String);
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatCardModule, MatIconModule,
    MatProgressSpinnerModule, MatSelectModule,
    MatFormFieldModule, MatButtonModule, MatTooltipModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {

  // ── Canvas refs ─────────────────────────────────────────────────────────
  @ViewChild('chartComparacion')  chartComparacionRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartProductos')    chartProductosRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartEstados')      chartEstadosRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartEmpleados')    chartEmpleadosRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartTicket')       chartTicketRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartCategorias')   chartCategoriasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chartAnios')        chartAniosRef!: ElementRef<HTMLCanvasElement>;

  // ── Estado ──────────────────────────────────────────────────────────────
  loading = true;
  kpis: KPIs | null = null;
  empleados: EmpleadoFiltro[] = [];

  // ── Filtros ─────────────────────────────────────────────────────────────
  anios = generarAnios();
  meses = [
    { valor: '01', nombre: 'Enero' }, { valor: '02', nombre: 'Febrero' },
    { valor: '03', nombre: 'Marzo' }, { valor: '04', nombre: 'Abril' },
    { valor: '05', nombre: 'Mayo' },  { valor: '06', nombre: 'Junio' },
    { valor: '07', nombre: 'Julio' }, { valor: '08', nombre: 'Agosto' },
    { valor: '09', nombre: 'Septiembre' }, { valor: '10', nombre: 'Octubre' },
    { valor: '11', nombre: 'Noviembre' }, { valor: '12', nombre: 'Diciembre' }
  ];

  filtros: FiltrosDashboard = {};
  filtroAnio = '';
  filtroMes  = '';
  filtroEmp  = '';
  mesesConDatos = 0;  // para mostrar aviso en el gráfico de comparación

  // ── Charts ──────────────────────────────────────────────────────────────
  private charts: Chart[] = [];

  constructor(private dashSvc: DashboardService) {}

  ngOnInit(): void {
    this.dashSvc.getEmpleados().subscribe({
      next: (emps) => { this.empleados = emps; },
      error: () => {}
    });
    this.cargarTodo();
  }

  ngOnDestroy(): void {
    this.destruirCharts();
  }

  // ── Filtros ─────────────────────────────────────────────────────────────
  aplicarFiltros(): void {
    this.filtros = {};
    if (this.filtroAnio) this.filtros.anio = this.filtroAnio;
    if (this.filtroMes)  this.filtros.mes  = this.filtroMes;
    if (this.filtroEmp)  this.filtros.id_empleado = this.filtroEmp;
    this.cargarTodo();
  }

  limpiarFiltros(): void {
    this.filtroAnio = '';
    this.filtroMes  = '';
    this.filtroEmp  = '';
    this.filtros    = {};
    this.cargarTodo();
  }

  hayFiltrosActivos(): boolean {
    return !!(this.filtroAnio || this.filtroMes || this.filtroEmp);
  }

  // ── Carga de datos ──────────────────────────────────────────────────────
  cargarTodo(): void {
    this.loading = true;
    this.destruirCharts();

    const f = this.filtros;

    forkJoin({
      kpis:           this.dashSvc.getKPIs(f),
      ventasMes:      this.dashSvc.getVentasPorMes(f),
      ventasAnio:     this.dashSvc.getVentasPorAnio(f),
      ventasEmp:      this.dashSvc.getVentasPorEmpleado(f),
      productosTop:   this.dashSvc.getProductosTop(f),
      estados:        this.dashSvc.getPedidosPorEstado(f),
      ticket:         this.dashSvc.getTicketPromedio(f),
      categorias:     this.dashSvc.getVentasPorCategoria(f),
      comparacion:    this.dashSvc.getComparacionPeriodos(f)
    }).subscribe({
      next: (data) => {
        this.kpis = data.kpis;
        this.loading = false;
        setTimeout(() => {
          this.renderComparacion(data.comparacion);
          this.renderProductos(data.productosTop);
          this.renderEstados(data.estados);
          this.renderEmpleados(data.ventasEmp);
          this.renderTicket(data.ticket);
          this.renderCategorias(data.categorias);
          this.renderAnios(data.ventasAnio);
        }, 80);
      },
      error: () => { this.loading = false; }
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────
  private destruirCharts(): void {
    this.charts.forEach(ch => ch.destroy());
    this.charts = [];
  }

  private pushChart(ch: Chart): void {
    this.charts.push(ch);
  }

  private canvas(ref: ElementRef<HTMLCanvasElement> | undefined): HTMLCanvasElement | null {
    return ref?.nativeElement ?? null;
  }

  private mesLabel(m: string): string {
    return MESES_NOMBRE[m] ?? m;
  }

  // ─── Gráfico 1: Comparación año actual vs anterior (line) ───────────────
  private renderComparacion(data: ComparacionPeriodo[]): void {
    const el = this.canvas(this.chartComparacionRef);
    if (!el) return;

    const anioActual   = this.filtroAnio || String(new Date().getFullYear());
    const anioAnterior = String(Number(anioActual) - 1);

    // Siempre mostrar los 12 meses en el eje X aunque no haya datos
    const TODOS_MESES = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    const dataMap = new Map(data.map(d => [d.mes, d]));

    const labelsCompletos = TODOS_MESES.map(m => this.mesLabel(m));
    const actualData   = TODOS_MESES.map(m => dataMap.get(m)?.anio_actual  ?? null);
    const anteriorData = TODOS_MESES.map(m => dataMap.get(m)?.anio_anterior ?? null);

    // Cuantos meses tienen datos reales (exponer al template)
    const mesesConDatos = actualData.filter(v => v !== null && v > 0).length;
    this.mesesConDatos = mesesConDatos;

    const cfg: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labelsCompletos,
        datasets: [
          {
            label: `${anioActual}`,
            data: actualData,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.08)',
            borderWidth: 2.5,
            tension: mesesConDatos > 2 ? 0.3 : 0,
            fill: true,
            spanGaps: false,
            pointBackgroundColor: '#6366f1',
            pointRadius: mesesConDatos <= 3 ? 7 : 5,
            pointHoverRadius: 9
          },
          {
            label: `${anioAnterior}`,
            data: anteriorData,
            borderColor: '#94a3b8',
            backgroundColor: 'rgba(148,163,184,0.05)',
            borderWidth: 2,
            tension: 0,
            fill: true,
            spanGaps: false,
            borderDash: [6, 3],
            pointBackgroundColor: '#94a3b8',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: {
          legend: { labels: { color: '#374151', font: { size: 12 } } },
          tooltip: {
            mode: 'index',
            intersect: false,
            filter: (item) => item.raw !== null
          }
        },
        scales: {
          x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(0,0,0,0.07)' } },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#6b7280',
              callback: (v) => '$' + Number(v).toLocaleString('es-EC', { minimumFractionDigits: 0 })
            },
            grid: { color: 'rgba(0,0,0,0.07)' }
          }
        }
      }
    };
    this.pushChart(new Chart(el, cfg));
  }

  // ─── Gráfico 2: Top productos (bar horizontal) ───────────────────────────
  private renderProductos(data: ProductoTop[]): void {
    const el = this.canvas(this.chartProductosRef);
    if (!el) return;

    const cfg: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.map(p => p.nombre_producto),
        datasets: [{
          label: 'Unidades vendidas',
          data: data.map(p => p.total_vendido),
          backgroundColor: data.map((_, i) => PALETTE_MULTI[i % PALETTE_MULTI.length]),
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: (ctx) => {
                const item = data[ctx.dataIndex];
                if (!item) return '';
                return `Ingresos: $${item.ingreso_total.toLocaleString('es-EC', { minimumFractionDigits: 2 })}`;
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(0,0,0,0.07)' } },
          y: { ticks: { color: '#374151', font: { size: 11 } }, grid: { display: false } }
        }
      }
    };
    this.pushChart(new Chart(el, cfg));
  }

  // ─── Gráfico 3: Pedidos por estado (doughnut) ────────────────────────────
  private renderEstados(data: PedidoEstado[]): void {
    const el = this.canvas(this.chartEstadosRef);
    if (!el) return;

    const cfg: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: data.map(e => e.estado),
        datasets: [{
          data: data.map(e => e.cantidad),
          backgroundColor: data.map(e => ESTADO_COLORS[e.estado] ?? '#64748b'),
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#374151', padding: 14, font: { size: 12 }, boxWidth: 14 }
          }
        }
      }
    };
    this.pushChart(new Chart(el, cfg));
  }

  // ─── Gráfico 4: Ventas por empleado (bar vertical) ───────────────────────
  private renderEmpleados(data: VentaEmpleado[]): void {
    const el = this.canvas(this.chartEmpleadosRef);
    if (!el) return;

    const cfg: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.map(e => e.empleado),
        datasets: [{
          label: 'Ventas ($)',
          data: data.map(e => e.total),
          backgroundColor: data.map((_, i) => PALETTE_MULTI[i % PALETTE_MULTI.length]),
          borderRadius: 8
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const item = data[ctx.dataIndex];
                if (!item) return ` $${Number(ctx.raw).toLocaleString('es-EC', { minimumFractionDigits: 2 })}`;
                return [
                  ` $${Number(ctx.raw).toLocaleString('es-EC', { minimumFractionDigits: 2 })}`,
                  ` ${item.cantidad} pedido${item.cantidad !== 1 ? 's' : ''}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#374151', maxRotation: 25, font: { size: 11 } },
            grid: { display: false }
          },
          y: {
            ticks: {
              color: '#6b7280',
              callback: (v) => '$' + Number(v).toLocaleString('es-EC', { minimumFractionDigits: 0 })
            },
            grid: { color: 'rgba(0,0,0,0.07)' }
          }
        }
      }
    };
    this.pushChart(new Chart(el, cfg));
  }

  // ─── Gráfico 5: Ticket promedio mensual (line) ───────────────────────────
  private renderTicket(data: TicketMes[]): void {
    const el = this.canvas(this.chartTicketRef);
    if (!el) return;

    // Rellenar los 12 meses
    const TODOS_MESES = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    const dataMap = new Map(data.map(d => [d.mes, d]));
    const labelsCompletos = TODOS_MESES.map(m => this.mesLabel(m));
    const ticketData = TODOS_MESES.map(m => dataMap.get(m)?.ticket_promedio ?? null);

    const cfg: ChartConfiguration = {
      type: 'line',
      data: {
        labels: labelsCompletos,
        datasets: [{
          label: 'Ticket promedio ($)',
          data: ticketData,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.08)',
          borderWidth: 2.5,
          tension: 0.3,
          fill: true,
          spanGaps: false,
          pointBackgroundColor: '#f59e0b',
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: {
          legend: { labels: { color: '#374151' } }
        },
        scales: {
          x: { ticks: { color: '#6b7280' }, grid: { color: 'rgba(0,0,0,0.07)' } },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#6b7280',
              callback: (v) => '$' + Number(v).toLocaleString('es-EC', { minimumFractionDigits: 2 })
            },
            grid: { color: 'rgba(0,0,0,0.07)' }
          }
        }
      }
    };
    this.pushChart(new Chart(el, cfg));
  }

  // ─── Gráfico 6: Ventas por categoría (bar horizontal) ───────────────────
  private renderCategorias(data: VentaCategoria[]): void {
    const el = this.canvas(this.chartCategoriasRef);
    if (!el) return;

    const cfg: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.map(c => c.categoria),
        datasets: [{
          label: 'Ingresos ($)',
          data: data.map(c => c.total),
          backgroundColor: data.map((_, i) => PALETTE_MULTI[i % PALETTE_MULTI.length]),
          borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const item = data[ctx.dataIndex];
                if (!item) return ` $${Number(ctx.raw).toLocaleString('es-EC', { minimumFractionDigits: 2 })}`;
                return [
                  ` $${Number(ctx.raw).toLocaleString('es-EC', { minimumFractionDigits: 2 })}`,
                  ` ${item.cantidad} unidades`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#6b7280',
              callback: (v) => '$' + Number(v).toLocaleString('es-EC', { minimumFractionDigits: 0 })
            },
            grid: { color: 'rgba(0,0,0,0.07)' }
          },
          y: { ticks: { color: '#374151' }, grid: { display: false } }
        },
        indexAxis: 'y'
      }
    };
    this.pushChart(new Chart(el, cfg));
  }

  // ─── Gráfico 7: Ventas por año (bar vertical) ────────────────────────────
  private renderAnios(data: VentaAnio[]): void {
    const el = this.canvas(this.chartAniosRef);
    if (!el) return;

    const gradientColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b'];

    const cfg: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: data.map(a => a.anio),
        datasets: [{
          label: 'Ventas totales ($)',
          data: data.map(a => a.total),
          backgroundColor: data.map((_, i) => gradientColors[i % gradientColors.length]),
          borderRadius: 10,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { ticks: { color: '#374151', font: { size: 13, weight: 'bold' } }, grid: { display: false } },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#6b7280',
              callback: (v) => '$' + Number(v).toLocaleString('es-EC', { minimumFractionDigits: 0 })
            },
            grid: { color: 'rgba(0,0,0,0.07)' }
          }
        }
      }
    };
    this.pushChart(new Chart(el, cfg));
  }

  // ─── Formato de moneda ───────────────────────────────────────────────────
  formatCurrency(value: number): string {
    return value.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}