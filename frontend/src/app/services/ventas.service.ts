import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Producto {
  id_producto: number;
  nombre_producto: string;
  precio_unitario: number;
  codigo_barras: string;
}

export interface Cliente {
  id_cliente: number;
  nombres: string;
  apellidos: string;
  correo: string;
}

export interface MetodoPago {
  id_metodo_pago: number;
  nombre_metodo: string;
  descripcion: string;
}

export interface VentaRequest {
  id_cliente: number;
  id_producto: number;
  cantidad: number;
  id_metodo_pago: number;
}

export interface VentaResponse {
  id_pedido: string;
  mensaje: string;
}

export interface Pedido {
  id_pedido: number;
  id_cliente: number;
  id_empleado: number;
  fecha_pedido: string;
  estado: string;
  total: number;
  observaciones: string;
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  constructor(private api: ApiService) {}

  listarProductos(): Observable<Producto[]> {
    return this.api.get<Producto[]>('/productos');
  }

  listarClientes(): Observable<Cliente[]> {
    return this.api.get<Cliente[]>('/clientes');
  }

  listarMetodosPago(): Observable<MetodoPago[]> {
    return this.api.get<MetodoPago[]>('/metodos-pago');
  }

  registrarVenta(payload: VentaRequest): Observable<VentaResponse> {
    return this.api.post<VentaResponse>('/ventas', payload);
  }

  listarVentas(): Observable<Pedido[]> {
    return this.api.get<Pedido[]>('/ventas');
  }
}
