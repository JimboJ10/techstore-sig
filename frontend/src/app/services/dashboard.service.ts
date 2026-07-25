import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

// ─── Tipos de respuesta del dashboard ───────────────────────────────────────

export interface KPIs {
  total_ventas_mes: number;
  cantidad_pedidos: number;
  productos_criticos: number;
  pedidos_pendientes: number;
  tiempo_promedio_despacho: number;
  bpm_pendientes: number;
  ticket_promedio: number;
  tasa_devolucion: number;
}

export interface VentaMes {
  mes: string;
  total: number;
}

export interface VentaAnio {
  anio: string;
  total: number;
}

export interface VentaEmpleado {
  empleado: string;
  total: number;
  cantidad: number;
}

export interface ProductoTop {
  nombre_producto: string;
  total_vendido: number;
  ingreso_total: number;
}

export interface PedidoEstado {
  estado: string;
  cantidad: number;
}

export interface TicketMes {
  mes: string;
  ticket_promedio: number;
}

export interface VentaCategoria {
  categoria: string;
  total: number;
  cantidad: number;
}

export interface ComparacionPeriodo {
  mes: string;
  anio_actual: number;
  anio_anterior: number;
}

export interface EmpleadoFiltro {
  id_empleado: number;
  nombre: string;
  cargo: string;
}

export interface FiltrosDashboard {
  anio?: string;
  mes?: string;
  id_empleado?: string;
}

// ─── Nombres de meses para etiquetas de gráficos ────────────────────────────
export const MESES_NOMBRE: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic'
};

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private params(filtros: FiltrosDashboard): HttpParams {
    let p = new HttpParams();
    if (filtros.anio)        p = p.set('anio', filtros.anio);
    if (filtros.mes)         p = p.set('mes', filtros.mes);
    if (filtros.id_empleado) p = p.set('id_empleado', filtros.id_empleado);
    return p;
  }

  getKPIs(f: FiltrosDashboard): Observable<KPIs> {
    return this.http.get<KPIs>(`${this.apiUrl}/dashboard/kpis`, { params: this.params(f) });
  }

  getVentasPorMes(f: FiltrosDashboard): Observable<VentaMes[]> {
    return this.http.get<VentaMes[]>(`${this.apiUrl}/dashboard/ventas-mes`, { params: this.params(f) });
  }

  getVentasPorAnio(f: FiltrosDashboard): Observable<VentaAnio[]> {
    return this.http.get<VentaAnio[]>(`${this.apiUrl}/dashboard/ventas-anio`, { params: this.params(f) });
  }

  getVentasPorEmpleado(f: FiltrosDashboard): Observable<VentaEmpleado[]> {
    return this.http.get<VentaEmpleado[]>(`${this.apiUrl}/dashboard/ventas-empleado`, { params: this.params(f) });
  }

  getProductosTop(f: FiltrosDashboard): Observable<ProductoTop[]> {
    return this.http.get<ProductoTop[]>(`${this.apiUrl}/dashboard/productos-top`, { params: this.params(f) });
  }

  getPedidosPorEstado(f: FiltrosDashboard): Observable<PedidoEstado[]> {
    return this.http.get<PedidoEstado[]>(`${this.apiUrl}/dashboard/pedidos-estado`, { params: this.params(f) });
  }

  getTicketPromedio(f: FiltrosDashboard): Observable<TicketMes[]> {
    return this.http.get<TicketMes[]>(`${this.apiUrl}/dashboard/ticket-promedio`, { params: this.params(f) });
  }

  getVentasPorCategoria(f: FiltrosDashboard): Observable<VentaCategoria[]> {
    return this.http.get<VentaCategoria[]>(`${this.apiUrl}/dashboard/ventas-categoria`, { params: this.params(f) });
  }

  getComparacionPeriodos(f: FiltrosDashboard): Observable<ComparacionPeriodo[]> {
    return this.http.get<ComparacionPeriodo[]>(`${this.apiUrl}/dashboard/comparacion-periodos`, { params: this.params(f) });
  }

  getEmpleados(): Observable<EmpleadoFiltro[]> {
    return this.http.get<EmpleadoFiltro[]>(`${this.apiUrl}/empleados`);
  }
}
