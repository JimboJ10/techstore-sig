import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface LecturaIOT {
  id_lectura: number;
  id_dispositivo: number;
  id_producto: number;
  id_envio: number;
  nombre_producto: string;
  codigo_leido: string;
  tipo_evento: string;
  fecha_lectura: string;
}

export interface EnvioPendiente {
  id_envio: number;
  id_pedido: number;
  id_cliente: number;
  cliente: string;
  id_producto: number;
  nombre_producto: string;
  codigo_barras: string;
  cantidad: number;
  fecha_pedido: string;
  estado_pedido: string;
  estado_envio: string;
}

@Injectable({
  providedIn: 'root'
})
export class BodegaService {

  constructor(private api: ApiService) {}

  listarLecturas(): Observable<LecturaIOT[]> {
    return this.api.get<LecturaIOT[]>('/iot/lecturas');
  }

  listarEnviosPendientes(): Observable<EnvioPendiente[]> {
    return this.api.get<EnvioPendiente[]>('/envios/pendientes');
  }
}
