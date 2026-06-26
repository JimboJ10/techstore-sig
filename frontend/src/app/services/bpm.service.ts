import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Producto } from './ventas.service';
import { Proveedor } from './proveedores.service';

export interface ProcesoBPM {
  id_proceso: number;
  id_proveedor: number;
  id_producto: number;
  nombre_producto: string;
  nombre_proveedor: string;
  cantidad_solicitada: number;
  estado_proceso: string;
  fecha_inicio: string;
  fecha_aprobacion: string;
  fecha_recepcion: string;
  activado_automaticamente: number;
}

export interface GenerarBpmRequest {
  id_proveedor: number;
  id_producto: number;
  cantidad_solicitada: number;
}

export interface MensajeResponse {
  mensaje: string;
}

// Re-exportamos Proveedor para que los componentes que ya lo importan desde aquí sigan funcionando
export type { Proveedor };

@Injectable({
  providedIn: 'root'
})
export class BpmService {

  constructor(private api: ApiService) {}

  listarProcesos(): Observable<ProcesoBPM[]> {
    return this.api.get<ProcesoBPM[]>('/procesos-bpm');
  }

  listarProductos(): Observable<Producto[]> {
    return this.api.get<Producto[]>('/productos');
  }

  listarProveedores(): Observable<Proveedor[]> {
    return this.api.get<Proveedor[]>('/proveedores');
  }

  generarOrden(payload: GenerarBpmRequest): Observable<MensajeResponse> {
    return this.api.post<MensajeResponse>('/procesos-bpm', payload);
  }

  aprobar(idProceso: number): Observable<MensajeResponse> {
    return this.api.put<MensajeResponse>(`/procesos-bpm/${idProceso}/aprobar`, {});
  }

  recibir(idProceso: number): Observable<MensajeResponse> {
    return this.api.put<MensajeResponse>(`/procesos-bpm/${idProceso}/recibir`, {});
  }
}
