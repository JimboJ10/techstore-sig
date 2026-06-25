import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Inventario {
  id_inventario: number;
  id_producto: number;
  nombre_producto: string;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  ubicacion_bodega: string;
}

export interface AlertaStock {
  id_producto: number;
  nombre_producto: string;
  stock_actual: number;
  stock_minimo: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  constructor(private api: ApiService) {}

  listar(): Observable<Inventario[]> {
    return this.api.get<Inventario[]>('/inventario');
  }

  alertas(): Observable<AlertaStock[]> {
    return this.api.get<AlertaStock[]>('/inventario/alertas');
  }
}
